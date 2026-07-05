export type SupplierStatus = "active" | "inactive";

export type Supplier = {
  id: string;
  name: string;
  ruc: string;
  contact: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  createdAt: string;
};

export type CreateSupplierInput = {
  name: string;
  ruc: string;
  contact: string;
  phone: string;
  address: string;
};

export type UpdateSupplierInput = Partial<CreateSupplierInput> & {
  status?: SupplierStatus;
};

export type SupplierResponse = Supplier & {
  message?: string;
};
