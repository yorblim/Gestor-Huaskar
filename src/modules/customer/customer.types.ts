export type Customer = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: string;
};

export type CreateCustomerInput = {
  name: string;
  phone?: string;
  address?: string;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export type CustomerResponse = Customer & {
  message?: string;
};
