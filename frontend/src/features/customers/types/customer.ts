export type CustomerDocType = "dni" | "ruc" | "ce" | "passport";

export interface Customer {
  id: string;
  name: string;
  docType?: CustomerDocType;
  docNumber?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreateCustomerInput {
  name: string;
  docType?: CustomerDocType;
  docNumber?: string;
  phone?: string;
  address?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export const DOCUMENT_LABELS: Record<CustomerDocType, string> = {
  dni: "DNI",
  ruc: "RUC",
  ce: "C.E.",
  passport: "Pasaporte",
};

export function formatCustomerDoc(customer: Pick<Customer, "docType" | "docNumber">): string {
  if (!customer.docType || !customer.docNumber) return "-";
  return `${DOCUMENT_LABELS[customer.docType]} ${customer.docNumber}`;
}