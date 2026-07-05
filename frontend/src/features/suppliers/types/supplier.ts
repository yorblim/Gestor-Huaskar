export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  ruc: string;
  contact: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  createdAt: string;
}

export interface CreateSupplierInput {
  name: string;
  ruc: string;
  contact: string;
  phone: string;
  address: string;
}

export interface UpdateSupplierInput {
  name?: string;
  ruc?: string;
  contact?: string;
  phone?: string;
  address?: string;
  status?: SupplierStatus;
}
