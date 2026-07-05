import { Router } from "express";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { getAuditLogsHandler } from "./audit.controller";

const router = Router();

router.get("/", authMiddleware, requireRole("ADMIN"), getAuditLogsHandler);

export default router;
