import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
  unitPrice: z.number().positive("El precio unitario debe ser mayor a 0"),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Proveedor requerido"),
  items: z.array(purchaseItemSchema).min(1, "Debe incluir al menos un producto"),
});
