import { Router } from "express";
import { getAllSalesHandler, getSaleByIdHandler, createSaleHandler, cancelSaleHandler, deleteSaleHandler } from "./sale.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createSaleSchema } from "./sale.validation";

const saleRouter = Router();

saleRouter.get("/", authMiddleware, getAllSalesHandler);
saleRouter.get("/:id", authMiddleware, getSaleByIdHandler);
saleRouter.post("/", authMiddleware, auditMiddleware("CREATE", "Sale"), validate(createSaleSchema), createSaleHandler);
saleRouter.patch("/:id/cancel", authMiddleware, auditMiddleware("CANCEL", "Sale"), cancelSaleHandler);
saleRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), auditMiddleware("DELETE", "Sale"), deleteSaleHandler);

export default saleRouter;
