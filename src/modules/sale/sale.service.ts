import { CreateSaleInput, SaleResponse } from "./sale.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";
import { consumeFromBatches } from "../batch/batch.service";
import { emitEvent } from "../notifications/notifications.service";

function toSaleResponse(sale: any): SaleResponse {
  return {
    id: sale.id,
    receiptType: sale.receiptType.toLowerCase() as "boleta" | "factura",
    customerDocType: sale.customerDocType?.toLowerCase() as "dni" | "ruc" | "ce" | "passport" | undefined,
    customerDocNumber: sale.customerDocNumber,
    customerName: sale.customerName,
    customerId: sale.customerId ?? undefined,
    items: sale.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
    })),
    subtotal: parseFloat(sale.subtotal?.toString() || "0"),
    discount: parseFloat(sale.discount?.toString() || "0"),
    tax: parseFloat(sale.tax?.toString() || "0"),
    total: parseFloat(sale.total.toString()),
    paymentMethod: sale.paymentMethod.toLowerCase() as "cash" | "card" | "yape" | "plin",
    payments: (sale.payments || []).map((p: any) => ({
      method: p.method.toLowerCase() as "cash" | "card" | "yape" | "plin",
      amount: parseFloat(p.amount.toString()),
    })),
    status: sale.status.toLowerCase() as "active" | "cancelled",
    createdAt: sale.createdAt.toISOString(),
    cancelledAt: sale.cancelledAt?.toISOString(),
  };
}

export async function getSaleById(id: string): Promise<SaleResponse | null> {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
  return sale ? toSaleResponse(sale) : null;
}

export async function getAllSales(query: Record<string, any> = {}): Promise<PaginatedResult<SaleResponse>> {
  const params = getPaginationParams(query);

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      include: { items: true, payments: true },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sale.count(),
  ]);

  return paginatedResult(sales.map(toSaleResponse), total, params);
}

export async function createSale(data: CreateSaleInput): Promise<SaleResponse> {
  if (!data.items || data.items.length === 0) {
    throw new AppError("La venta debe tener al menos un producto.", 400);
  }

  if (data.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new AppError("Cliente no encontrado.", 404);
    }
  }

  const TAX_RATE = 0.18;
  let subtotal = 0;
  const itemSnapshots: { productId: string; quantity: number; unitPrice: number; sub: number; productName: string }[] = [];

  for (const item of data.items) {
    if (item.quantity <= 0) {
      throw new AppError("Cantidad inválida.", 400);
    }

    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw new AppError("Producto no encontrado.", 404);
    }

    const unitPrice = parseFloat(product.price.toString());
    const sub = unitPrice * item.quantity;

    subtotal += sub;
    itemSnapshots.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      sub,
      productName: product.name,
    });
  }

  const discount = data.discount || 0;
  const afterDiscount = subtotal - discount;
  const tax = data.receiptType === "factura" ? Math.round(afterDiscount * TAX_RATE * 100) / 100 : 0;
  const total = afterDiscount + tax;

  if (data.payments && data.payments.length > 0) {
    const paymentsSum = data.payments.reduce((s, p) => s + p.amount, 0);
    if (Math.abs(paymentsSum - total) > 0.01) {
      throw new AppError("La suma de los pagos no coincide con el total.", 400);
    }
  }

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        receiptType: data.receiptType.toUpperCase() as "BOLETA" | "FACTURA",
        customerDocType: data.customerDocType?.toUpperCase() as "DNI" | "RUC" | "CE" | "PASSPORT" | null,
        customerDocNumber: data.customerDocNumber,
        customerName: data.customerName,
        customerId: data.customerId ?? null,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: data.paymentMethod.toUpperCase() as "CASH" | "CARD" | "YAPE" | "PLIN",
        status: "ACTIVE",
      },
    });

    for (const item of itemSnapshots) {
      await tx.saleItem.create({
        data: {
          saleId: newSale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.sub,
        },
      });
    }

    const paymentsData = data.payments && data.payments.length > 0
      ? data.payments
      : [{ method: data.paymentMethod, amount: total }];

    for (const payment of paymentsData) {
      await tx.salePayment.create({
        data: {
          saleId: newSale.id,
          method: payment.method.toUpperCase() as "CASH" | "CARD" | "YAPE" | "PLIN",
          amount: payment.amount,
        },
      });
    }

    for (const item of itemSnapshots) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new AppError("Producto no encontrado.", 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, requerido: ${item.quantity}`, 400);
      }
      const stockBefore = product.stock;
      const stockAfter = stockBefore - item.quantity;

      const requestedBatchCode = data.batchCodes?.[item.productId];
      let batches: { batchCode: string; quantity: number }[] = [];

      if (requestedBatchCode) {
        const specificBatch = await tx.productBatch.findFirst({
          where: { productId: item.productId, code: requestedBatchCode },
        });
        if (!specificBatch || specificBatch.quantity < item.quantity) {
          throw new AppError(`Stock insuficiente en lote ${requestedBatchCode}`, 400);
        }
        await tx.productBatch.update({
          where: { id: specificBatch.id },
          data: { quantity: { decrement: item.quantity } },
        });
        batches = [{ batchCode: specificBatch.code, quantity: item.quantity }];
      } else {
        const hasBatches = await tx.productBatch.findFirst({
          where: { productId: item.productId, quantity: { gt: 0 } },
        });
        if (hasBatches) {
          batches = await consumeFromBatches(item.productId, item.quantity, tx);
        }
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: stockAfter },
      });

      if (batches.length > 0) {
        for (const batch of batches) {
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              movementType: "SALE",
              quantity: batch.quantity,
              stockBefore,
              stockAfter,
              batchCode: batch.batchCode,
              referenceId: newSale.id,
            },
          });
        }
      } else {
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            productName: item.productName,
            movementType: "SALE",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            referenceId: newSale.id,
          },
        });
      }
    }

    return tx.sale.findUnique({
      where: { id: newSale.id },
      include: { items: true, payments: true },
    });
  });

  if (!sale) {
    throw new AppError("Error al crear la venta", 500);
  }

  const result = toSaleResponse(sale);
  emitEvent("sale:created", result);
  return result;
}

export async function cancelSale(id: string): Promise<SaleResponse | null> {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!sale) return null;
  if (sale.status === "CANCELLED") {
    throw new AppError("La venta ya está anulada.", 400);
  }

  const updatedSale = await prisma.$transaction(async (tx) => {
    const saleMovements = await tx.inventoryMovement.findMany({
      where: { referenceId: sale.id, movementType: "SALE" },
    });

    for (const item of sale.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const itemMovements = saleMovements.filter((m) => m.productId === item.productId);

      for (const movement of itemMovements) {
        if (movement.batchCode) {
          const batch = await tx.productBatch.findFirst({
            where: { productId: item.productId, code: movement.batchCode },
          });
          if (batch) {
            await tx.productBatch.update({
              where: { id: batch.id },
              data: { quantity: { increment: movement.quantity } },
            });
          }
        }
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          productName: product.name,
          movementType: "ADJUSTMENT",
          quantity: item.quantity,
          stockBefore: product.stock,
          stockAfter: product.stock + item.quantity,
          reason: "Anulación de venta",
          referenceId: sale.id,
        },
      });
    }

    return tx.sale.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
      include: { items: true, payments: true },
    });
  });

  const result = toSaleResponse(updatedSale);
  emitEvent("sale:cancelled", result);
  return result;
}

export async function deleteSale(id: string): Promise<boolean> {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!sale) return false;

  return prisma.$transaction(async (tx) => {
    const saleMovements = await tx.inventoryMovement.findMany({
      where: { referenceId: sale.id, movementType: "SALE" },
    });

    if (sale.status !== "CANCELLED") {
      for (const item of sale.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        const itemMovements = saleMovements.filter((m) => m.productId === item.productId);

        for (const movement of itemMovements) {
          if (movement.batchCode) {
            const batch = await tx.productBatch.findFirst({
              where: { productId: item.productId, code: movement.batchCode },
            });
            if (batch) {
              await tx.productBatch.update({
                where: { id: batch.id },
                data: { quantity: { increment: movement.quantity } },
              });
            }
          }
        }

        await tx.inventoryMovement.updateMany({
          where: { referenceId: sale.id, movementType: "SALE" },
          data: { referenceId: null },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            productName: product.name,
            movementType: "ADJUSTMENT",
            quantity: item.quantity,
            stockBefore: product.stock,
            stockAfter: product.stock + item.quantity,
            reason: `Eliminación de venta ID: ${sale.id}`,
          },
        });
      }
    }

    await tx.sale.delete({ where: { id } });
    return true;
  });
}
