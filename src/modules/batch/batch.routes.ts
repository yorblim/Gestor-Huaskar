import { Router } from "express";
import {
  createBatchHandler,
  getBatchesByProductHandler,
  getExpiringBatchesHandler,
} from "./batch.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";

const batchRouter = Router();

batchRouter.post("/", authMiddleware, auditMiddleware("CREATE", "ProductBatch"), createBatchHandler);
batchRouter.get("/product/:productId", authMiddleware, getBatchesByProductHandler);
batchRouter.get("/expiring", authMiddleware, getExpiringBatchesHandler);

export default batchRouter;
