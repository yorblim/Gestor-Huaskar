import { BatchInput, BatchResponse } from "./batch.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

function toBatchResponse(batch: any): BatchResponse {
  return {
    id: batch.id,
    productId: batch.productId,
    code: batch.code,
    quantity: batch.quantity,
    expirationDate: batch.expirationDate?.toISOString() || null,
    receivedAt: batch.receivedAt.toISOString(),
  };
}

export async function createBatch(data: BatchInput): Promise<BatchResponse> {
  if (data.quantity <= 0) {
    throw new AppError("La cantidad del lote debe ser mayor a 0.", 400);
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      throw new AppError("Producto no encontrado.", 404);
    }

    const batch = await tx.productBatch.create({
      data: {
        productId: data.productId,
        code: data.code,
        quantity: data.quantity,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });

    const stockBefore = product.stock;
    const stockAfter = stockBefore + data.quantity;

    await tx.product.update({
      where: { id: data.productId },
      data: { stock: stockAfter },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: data.productId,
        productName: product.name,
        movementType: "PURCHASE",
        quantity: data.quantity,
        stockBefore,
        stockAfter,
        batchCode: data.code,
        reason: "Ingreso por lote",
      },
    });

    return toBatchResponse(batch);
  });
}

export async function getBatchesByProduct(productId: string): Promise<BatchResponse[]> {
  const batches = await prisma.productBatch.findMany({
    where: { productId },
    orderBy: [{ expirationDate: { sort: "asc", nulls: "last" } }],
  });
  return batches.map(toBatchResponse);
}

export async function getExpiringBatches(days: number): Promise<BatchResponse[]> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  const batches = await prisma.productBatch.findMany({
    where: {
      expirationDate: { not: null, lte: targetDate },
      quantity: { gt: 0 },
    },
    orderBy: { expirationDate: "asc" },
  });
  return batches.map(toBatchResponse);
}

export async function consumeFromBatches(
  productId: string,
  quantity: number,
  tx?: any
): Promise<{ batchCode: string; quantity: number }[]> {
  const client = tx || prisma;

  const batches = await client.productBatch.findMany({
    where: {
      productId,
      quantity: { gt: 0 },
      OR: [
        { expirationDate: null },
        { expirationDate: { gt: new Date() } },
      ],
    },
    orderBy: [{ expirationDate: { sort: "asc", nulls: "last" } }, { receivedAt: "asc" }],
  });

  let remaining = quantity;
  const consumption: { batchCode: string; quantity: number }[] = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    const taken = Math.min(batch.quantity, remaining);
    await client.productBatch.update({
      where: { id: batch.id },
      data: { quantity: { decrement: taken } },
    });
    consumption.push({ batchCode: batch.code, quantity: taken });
    remaining -= taken;
  }

  if (remaining > 0) {
    throw new AppError("Stock insuficiente en lotes.", 400);
  }

  return consumption;
}
