import { CreateCustomerInput, UpdateCustomerInput, CustomerResponse } from "./customer.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";

function toCustomerResponse(customer: any): CustomerResponse {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone ?? undefined,
    address: customer.address ?? undefined,
    createdAt: customer.createdAt.toISOString(),
  };
}

export async function getAllCustomers(query: Record<string, any> = {}): Promise<PaginatedResult<CustomerResponse>> {
  const params = getPaginationParams(query);
  const where = params.search ? { name: { contains: params.search } } : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.customer.count({ where }),
  ]);

  return paginatedResult(customers.map(toCustomerResponse), total, params);
}

export async function getCustomerById(id: string): Promise<CustomerResponse | null> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  return customer ? toCustomerResponse(customer) : null;
}

export async function createCustomer(data: CreateCustomerInput): Promise<CustomerResponse> {
  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone ?? null,
      address: data.address ?? null,
    },
  });
  return toCustomerResponse(customer);
}

export async function updateCustomer(id: string, data: UpdateCustomerInput): Promise<CustomerResponse> {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Cliente no encontrado.", 404);
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone ?? null }),
      ...(data.address !== undefined && { address: data.address ?? null }),
    },
  });
  return toCustomerResponse(customer);
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Cliente no encontrado o tiene ventas asociadas.", 404);
  }

  const salesCount = await prisma.sale.count({ where: { customerId: id } });
  if (salesCount > 0) {
    throw new AppError("No se puede eliminar el cliente porque tiene ventas asociadas.", 400);
  }

  await prisma.customer.delete({ where: { id } });
  return true;
}
