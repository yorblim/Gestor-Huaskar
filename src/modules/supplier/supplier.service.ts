import { CreateSupplierInput, UpdateSupplierInput, SupplierResponse } from "./supplier.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";

function toSupplierResponse(supplier: any): SupplierResponse {
  return {
    id: supplier.id,
    name: supplier.name,
    ruc: supplier.ruc,
    contact: supplier.contact,
    phone: supplier.phone,
    address: supplier.address,
    status: supplier.status.toLowerCase() as "active" | "inactive",
    createdAt: supplier.createdAt.toISOString(),
  };
}

export async function getAllSuppliers(query: Record<string, any> = {}): Promise<PaginatedResult<SupplierResponse>> {
  const params = getPaginationParams(query);
  const where = params.search
    ? {
        OR: [
          { name: { contains: params.search } },
          { ruc: { contains: params.search } },
        ],
      }
    : {};

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return paginatedResult(suppliers.map(toSupplierResponse), total, params);
}

export async function getSupplierById(id: string): Promise<SupplierResponse | null> {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  return supplier ? toSupplierResponse(supplier) : null;
}

export async function createSupplier(data: CreateSupplierInput): Promise<SupplierResponse> {
  const supplier = await prisma.supplier.create({
    data: {
      name: data.name,
      ruc: data.ruc,
      contact: data.contact,
      phone: data.phone,
      address: data.address,
    },
  });
  return toSupplierResponse(supplier);
}

export async function updateSupplier(id: string, data: UpdateSupplierInput): Promise<SupplierResponse> {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.status) {
    updateData.status = data.status.toUpperCase();
  }
  const supplier = await prisma.supplier.update({
    where: { id },
    data: updateData,
  });
  return toSupplierResponse(supplier);
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Proveedor no encontrado.", 404);
  }

  await prisma.supplier.delete({ where: { id } });
  return true;
}
