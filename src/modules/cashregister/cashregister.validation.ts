import { z } from "zod";

export const openSessionSchema = z.object({
  openingAmount: z.number().min(0, "El monto inicial no puede ser negativo"),
  notes: z.string().optional(),
});

export const closeSessionSchema = z.object({
  closingAmount: z.number().min(0, "El monto final no puede ser negativo"),
  notes: z.string().optional(),
});
