import { Request, Response, NextFunction } from "express";
import { createBatch, getBatchesByProduct, getExpiringBatches } from "./batch.service";

export async function createBatchHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const batch = await createBatch(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
}

export async function getBatchesByProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    const batches = await getBatchesByProduct(productId);
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
}

export async function getExpiringBatchesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string, 10) || 7;
    const batches = await getExpiringBatches(days);
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
}
