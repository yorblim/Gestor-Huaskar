import { CreateProductInput, UpdateProductInput, ProductResponse } from "./product.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";

function toProductResponse(product: any): ProductResponse {
  const price = parseFloat(product.price.toString());
  const costPrice = parseFloat(product.costPrice?.toString() || "0");
  const margin = costPrice > 0 ? ((price - costPrice) / price) * 100 : 0;
  return {
    id: product.id,
    code: product.code,
    barcode: product.barcode || null,
    name: product.name,
    price,
    costPrice,
    stock: product.stock,
    minStock: product.minStock,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category?.name || null,
    createdAt: product.createdAt.toISOString(),
    isLowStock: product.stock <= product.minStock,
    margin: Math.round(margin * 100) / 100,
  };
}

export async function getAllProducts(query: Record<string, any> = {}): Promise<PaginatedResult<ProductResponse>> {
  const params = getPaginationParams(query);
  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search } },
          { code: { contains: params.search } },
          { barcode: { contains: params.search } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return paginatedResult(products.map(toProductResponse), total, params);
}

export async function getProductById(id: string): Promise<ProductResponse | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });
  return product ? toProductResponse(product) : null;
}

export async function createProduct(data: CreateProductInput): Promise<ProductResponse> {
  const product = await prisma.product.create({
    data: {
      code: data.code,
      barcode: data.barcode || null,
      name: data.name,
      price: data.price,
      costPrice: data.costPrice,
      stock: data.stock,
      minStock: data.minStock,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
    },
    include: { category: { select: { name: true } } },
  });
  return toProductResponse(product);
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<ProductResponse> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Producto no encontrado.", 404);
  }

  const { stock: _stock, ...safeData } = data;
  const product = await prisma.product.update({
    where: { id },
    data: safeData,
    include: { category: { select: { name: true } } },
  });
  return toProductResponse(product);
}

export async function getProductByBarcode(barcode: string): Promise<ProductResponse | null> {
  const product = await prisma.product.findUnique({
    where: { barcode },
    include: { category: { select: { name: true } } },
  });
  return product ? toProductResponse(product) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Producto no encontrado o tiene registros asociados.", 404);
  }

  await prisma.product.delete({ where: { id } });
  return true;
}
