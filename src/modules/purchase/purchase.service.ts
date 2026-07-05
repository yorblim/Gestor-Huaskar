import { CreatePurchaseOrderInput, PurchaseOrderResponse } from "./purchase.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";

function toPurchaseOrderResponse(order: any): PurchaseOrderResponse {
  return {
    id: order.id,
    supplierId: order.supplierId,
    supplierName: order.supplierName,
    items: order.items.map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unitPrice.toString()),
      subtotal: parseFloat(item.subtotal.toString()),
    })),
    total: parseFloat(order.total.toString()),
    status: order.status.toLowerCase() as "pending" | "received" | "cancelled",
    createdAt: order.createdAt.toISOString(),
    receivedAt: order.receivedAt?.toISOString(),
  };
}

export async function getAllPurchaseOrders(query: Record<string, any> = {}): Promise<PaginatedResult<PurchaseOrderResponse>> {
  const params = getPaginationParams(query);

  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      include: { items: true },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.count(),
  ]);

  return paginatedResult(orders.map(toPurchaseOrderResponse), total, params);
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrderResponse | null> {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? toPurchaseOrderResponse(order) : null;
}

export async function createPurchaseOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrderResponse> {
  const supplier = await prisma.supplier.findUnique({ where: { id: data.supplierId } });
  if (!supplier) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  if (!data.items || data.items.length === 0) {
    throw new AppError("La orden debe tener al menos un item.", 400);
  }

  let total = 0;
  const itemsWithNames: { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }[] = [];

  for (const item of data.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) {
      throw new AppError(`Producto con ID ${item.productId} no encontrado.`, 404);
    }

    if (item.quantity <= 0 || item.unitPrice <= 0) {
      throw new AppError("Cantidad y precio unitario deben ser mayores a 0.", 400);
    }

    const subtotal = item.quantity * item.unitPrice;
    total += subtotal;

    itemsWithNames.push({
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal,
    });
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        supplierName: supplier.name,
        total,
        status: "PENDING",
        items: {
          create: itemsWithNames.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
    });

    return tx.purchaseOrder.findUnique({
      where: { id: created.id },
      include: { items: true },
    });
  });

  return toPurchaseOrderResponse(order!);
}

export async function receivePurchaseOrder(id: string): Promise<PurchaseOrderResponse | null> {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return null;

  if (order.status === "RECEIVED") {
    throw new AppError("La orden ya ha sido recibida.", 400);
  }

  if (order.status === "CANCELLED") {
    throw new AppError("No se puede recibir una orden cancelada.", 400);
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new AppError(`El producto "${item.productName}" (ID: ${item.productId}) ya no existe.`, 404);
      }

      const stockBefore = product.stock;
      const stockAfter = stockBefore + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: stockAfter },
      });

      const batchCode = `PO-${order.id.slice(0, 8)}-${item.productId.slice(0, 6)}`;

      await tx.productBatch.create({
        data: {
          productId: item.productId,
          code: batchCode,
          quantity: item.quantity,
          receivedAt: new Date(),
        },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          productName: product.name,
          movementType: "PURCHASE",
          quantity: item.quantity,
          stockBefore,
          stockAfter,
          batchCode,
          reason: `Recepción de orden de compra ID: ${order.id}`,
        },
      });
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
      include: { items: true },
    });
  });

  return toPurchaseOrderResponse(updatedOrder);
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrderResponse | null> {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return null;

  if (order.status === "RECEIVED") {
    throw new AppError("No se puede cancelar una orden ya recibida.", 400);
  }

  if (order.status === "CANCELLED") {
    throw new AppError("La orden ya está cancelada.", 400);
  }

  const updatedOrder = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { items: true },
  });

  return toPurchaseOrderResponse(updatedOrder);
}
