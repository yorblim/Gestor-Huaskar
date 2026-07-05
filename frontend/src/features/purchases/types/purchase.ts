export type PurchaseOrderStatus = "pending" | "received" | "cancelled";

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  total: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  receivedAt?: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}
