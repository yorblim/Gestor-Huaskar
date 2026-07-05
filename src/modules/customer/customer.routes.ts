import { Router } from "express";
import { getAllCustomersHandler, getCustomerByIdHandler, createCustomerHandler, updateCustomerHandler, deleteCustomerHandler } from "./customer.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCustomerSchema, updateCustomerSchema } from "./customer.validation";

const customerRouter = Router();

customerRouter.get("/", authMiddleware, getAllCustomersHandler);
customerRouter.get("/:id", authMiddleware, getCustomerByIdHandler);
customerRouter.post("/", authMiddleware, auditMiddleware("CREATE", "Customer"), validate(createCustomerSchema), createCustomerHandler);
customerRouter.put("/:id", authMiddleware, auditMiddleware("UPDATE", "Customer"), validate(updateCustomerSchema), updateCustomerHandler);
customerRouter.delete("/:id", authMiddleware, requireRole("ADMIN"), auditMiddleware("DELETE", "Customer"), deleteCustomerHandler);

export default customerRouter;
