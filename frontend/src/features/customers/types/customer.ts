export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  address?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;
