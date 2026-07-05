import { z } from "zod";

export const createProductSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  costPrice: z.number().min(0, "El costo no puede ser negativo"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  minStock: z.number().int().min(0, "El stock mínimo no puede ser negativo"),
  categoryId: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();
