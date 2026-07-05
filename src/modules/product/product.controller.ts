import { Request, Response, NextFunction } from "express";
import {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from "./product.service";
import { CreateProductInput, UpdateProductInput, ProductResponse } from "./product.types";

export async function getAllProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getAllProducts(req.query as Record<string, any>);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const product = await getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data: CreateProductInput = req.body;
    const product = await createProductService(data);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data: UpdateProductInput = req.body;
    const product = await updateProductService(id, data);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductByBarcodeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const barcode = req.params.barcode as string;
    const product = await getProductByBarcode(barcode);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const deleted = await deleteProductService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Producto no encontrado o tiene registros asociados.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado.",
    });
  } catch (error) {
    next(error);
  }
}
