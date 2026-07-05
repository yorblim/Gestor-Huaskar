export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export type PaymentMethod = "cash" | "card" | "yape" | "plin";

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export type SaleStatus = "active" | "cancelled";

export type DocumentType = "dni" | "ruc" | "ce" | "passport";

export type ReceiptType = "boleta" | "factura";

export interface Sale {
  id: string;
  receiptType: ReceiptType;
  customerDocType?: DocumentType;
  customerDocNumber?: string;
  customerName?: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  payments: PaymentSplit[];
  status: SaleStatus;
  createdAt: string;
  cancelledAt?: string;
}

export interface CreateSaleInput {
  receiptType: ReceiptType;
  customerDocType?: DocumentType;
  customerDocNumber?: string;
  customerName?: string;
  customerId?: string;
  items: CreateSaleItemInput[];
  paymentMethod: PaymentMethod;
  payments?: PaymentSplit[];
  batchCodes?: Record<string, string>;
  discount?: number;
}
