import { Request, Response, NextFunction } from "express";
import { createSupplier, getAllSuppliers, getSupplierById, updateSupplier, deleteSupplier } from "./supplier.service";

export const supplierController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllSuppliers(req.query as Record<string, any>);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const supplier = await getSupplierById(id);
      if (!supplier) {
        res.status(404).json({ success: false, message: "Proveedor no encontrado" });
        return;
      }
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplier = await createSupplier(req.body);
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const supplier = await updateSupplier(id, req.body);
      if (!supplier) {
        res.status(404).json({ success: false, message: "Proveedor no encontrado" });
        return;
      }
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const deleted = await deleteSupplier(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Proveedor no encontrado" });
        return;
      }
      res.json({ success: true, message: "Proveedor eliminado" });
    } catch (error) {
      next(error);
    }
  },
};
