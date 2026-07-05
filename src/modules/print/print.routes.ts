import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getReceiptHandler } from "./print.controller";

const router = Router();

router.get("/receipt/:id", authMiddleware, getReceiptHandler);

export default router;
