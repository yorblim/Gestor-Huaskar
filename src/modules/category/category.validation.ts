import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido").max(100),
});

export const updateCategorySchema = createCategorySchema;
