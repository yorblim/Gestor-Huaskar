export type MovementType = "purchase" | "sale" | "adjustment" | "expiration";

export type CreateMovementInput = {
  productId: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  referenceId?: string;
  supplierId?: string;
};

export type MovementResponse = {
  id: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason?: string;
  referenceId?: string;
  supplierId?: string;
  supplierName?: string;
  createdAt: string;
};
