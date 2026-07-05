import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { getReceiptText } from "./print.service";

export async function getReceiptHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const text = await getReceiptText(req.params.id as string);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(text);
  } catch (error: unknown) {
    if (error instanceof AppError && error.statusCode === 404) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}
