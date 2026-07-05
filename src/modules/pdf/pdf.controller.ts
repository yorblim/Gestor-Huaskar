import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { getInvoiceSale, buildInvoicePDF } from "./pdf.service";

export async function getInvoiceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const sale = await getInvoiceSale(req.params.id as string);
    const doc = buildInvoicePDF(sale);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=factura-${sale.id.slice(0, 8)}.pdf`);
    doc.pipe(res);
  } catch (error: unknown) {
    if (error instanceof AppError && error.statusCode === 404) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}
