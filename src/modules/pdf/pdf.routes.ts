import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getInvoiceHandler } from "./pdf.controller";

const router = Router();

router.get("/invoice/:id", authMiddleware, getInvoiceHandler);

export default router;
