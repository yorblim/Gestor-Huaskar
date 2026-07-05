import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import productRouter from "../modules/product/product.routes";
import saleRouter from "../modules/sale/sale.routes";
import customerRouter from "../modules/customer/customer.routes";
import inventoryRouter from "../modules/inventory/inventory.routes";
import supplierRouter from "../modules/supplier/supplier.routes";
import purchaseRouter from "../modules/purchase/purchase.routes";
import reportRouter from "../modules/report/report.routes";
import auditRouter from "../modules/audit/audit.routes";
import categoryRouter from "../modules/category/category.routes";
import uploadRouter from "../modules/upload/upload.routes";
import printRouter from "../modules/print/print.routes";
import pdfRouter from "../modules/pdf/pdf.routes";
import importRouter from "../modules/import/import.routes";
import batchRouter from "../modules/batch/batch.routes";
import cashregisterRouter from "../modules/cashregister/cashregister.routes";
import purchaseSuggestionRouter from "../modules/purchasesuggestion/purchasesuggestion.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API de Gestor Huaskar v1.0",
  });
});

router.get("/ping", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ping ok",
  });
});

router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/sales", saleRouter);
router.use("/customers", customerRouter);
router.use("/inventory", inventoryRouter);
router.use("/suppliers", supplierRouter);
router.use("/purchases", purchaseRouter);
router.use("/reports", reportRouter);
router.use("/audit-logs", auditRouter);
router.use("/uploads", uploadRouter);
router.use("/print", printRouter);
router.use("/pdf", pdfRouter);
router.use("/import", importRouter);
router.use("/batches", batchRouter);
router.use("/cash-register", cashregisterRouter);
router.use("/purchase-suggestions", purchaseSuggestionRouter);

export default router;
