import { z } from "zod";

export const createMovementSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  movementType: z.literal("adjustment", { message: "Solo se permiten ajustes manuales" }),
  quantity: z.number().int("La cantidad debe ser entero").min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().optional(),
  referenceId: z.string().optional(),
});
