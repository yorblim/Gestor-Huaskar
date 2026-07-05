import { Request, Response, NextFunction } from "express";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "./category.service";

export async function getAllHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
}

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await createCategory(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (error) { next(error); }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cat = await updateCategory(req.params.id as string, req.body);
    if (!cat) return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    res.json({ success: true, data: cat });
  } catch (error) { next(error); }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await deleteCategory(req.params.id as string);
    if (!ok) return res.status(400).json({ success: false, message: "No se pudo eliminar" });
    res.json({ success: true, message: "Categoría eliminada" });
  } catch (error) { next(error); }
}
