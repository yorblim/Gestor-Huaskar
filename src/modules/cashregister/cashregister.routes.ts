import { Router } from "express";
import {
  openSessionHandler,
  closeSessionHandler,
  getActiveSessionHandler,
  getSessionsHandler,
} from "./cashregister.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { openSessionSchema, closeSessionSchema } from "./cashregister.validation";

const cashregisterRouter = Router();

cashregisterRouter.post("/open", authMiddleware, requireRole("ADMIN"), auditMiddleware("OPEN", "CashRegister"), validate(openSessionSchema), openSessionHandler);
cashregisterRouter.post("/:id/close", authMiddleware, requireRole("ADMIN"), auditMiddleware("CLOSE", "CashRegister"), validate(closeSessionSchema), closeSessionHandler);
cashregisterRouter.get("/active", authMiddleware, getActiveSessionHandler);
cashregisterRouter.get("/", authMiddleware, getSessionsHandler);

export default cashregisterRouter;
