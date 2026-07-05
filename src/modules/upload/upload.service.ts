import { prisma } from "../../lib/prisma";
import type { UploadResponse } from "./upload.types";

export async function uploadProductImage(productId: string, filename: string): Promise<UploadResponse> {
  const imageUrl = `/uploads/${filename}`;
  const product = await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });
  return { imageUrl, id: product.id };
}

export async function deleteProductImage(productId: string): Promise<void> {
  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl: null },
  });
}
