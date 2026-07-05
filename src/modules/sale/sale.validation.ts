import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
});

const paymentSplitSchema = z.object({
  method: z.enum(["cash", "card", "yape", "plin"], { message: "Método de pago inválido" }),
  amount: z.number().positive("El monto debe ser mayor a 0"),
});

export const createSaleSchema = z.object({
  receiptType: z.enum(["boleta", "factura"], { message: "Tipo de comprobante inválido" }),
  customerDocType: z.enum(["dni", "ruc", "ce", "passport"]).optional(),
  customerDocNumber: z.string().optional(),
  customerName: z.string().optional(),
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, "Debe incluir al menos un producto"),
  paymentMethod: z.enum(["cash", "card", "yape", "plin"], { message: "Método de pago inválido" }),
  discount: z.number().min(0).optional(),
  payments: z.array(paymentSplitSchema).optional(),
  batchCodes: z.record(z.string(), z.string()).optional(),
});
