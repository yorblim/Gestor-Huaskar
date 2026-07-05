import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { Category, CreateCategoryInput } from "./category.types";

export async function getAllCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    productCount: c._count.products,
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const category = await prisma.category.create({ data: { name: data.name } });
  return { id: category.id, name: category.name, createdAt: category.createdAt.toISOString() };
}

export async function updateCategory(id: string, data: CreateCategoryInput): Promise<Category> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  const category = await prisma.category.update({ where: { id }, data: { name: data.name } });
  return { id: category.id, name: category.name, createdAt: category.createdAt.toISOString() };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Categoría no encontrada.", 404);
  }

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new AppError("No se pudo eliminar: la categoría tiene productos asociados.", 400);

  await prisma.category.delete({ where: { id } });
  return true;
}
