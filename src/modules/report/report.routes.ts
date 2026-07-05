import { Router } from "express";
import { reportController } from "./report.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/sales", authMiddleware, reportController.sales);
router.get("/purchases", authMiddleware, reportController.purchases);
router.get("/low-stock", authMiddleware, reportController.lowStock);
router.get("/top-selling", authMiddleware, reportController.topSelling);
router.get("/profit", authMiddleware, reportController.profit);
router.get("/daily-close", authMiddleware, reportController.dailyClose);
router.get("/products/csv", authMiddleware, reportController.exportProductsCSV);
router.get("/sales/csv", authMiddleware, reportController.exportSalesCSV);

export default router;
