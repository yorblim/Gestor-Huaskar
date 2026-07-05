import { Request, Response, NextFunction } from "express";
import { uploadProductImage, deleteProductImage } from "./upload.service";

export async function uploadProductImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Archivo requerido" });
      return;
    }
    const result = await uploadProductImage(req.params.id as string, req.file.filename);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteProductImage(req.params.id as string);
    res.json({ success: true, message: "Imagen eliminada" });
  } catch (error) {
    next(error);
  }
}
