import { Router } from "express";
import { validateLogin, validateRegister } from "./auth.validation";
import { login, register, logout, profile, adminPanel } from "./auth.controller";
import { authMiddleware, requireRole } from "../../middlewares/auth.middleware";
import { auditMiddleware } from "../../middlewares/audit.middleware";
import {
  getAllUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./user.controller";
import { validateCreateUser, validateUpdateUser } from "./user.validation";

const authRouter = Router();

authRouter.post("/login", validateLogin, login);
authRouter.post("/register", authMiddleware, requireRole("ADMIN"), validateRegister, register);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/profile", authMiddleware, profile);
authRouter.get("/admin", authMiddleware, requireRole("ADMIN"), adminPanel);

authRouter.get("/users", authMiddleware, requireRole("ADMIN"), getAllUsersHandler);
authRouter.post("/users", authMiddleware, requireRole("ADMIN"), auditMiddleware("CREATE", "User"), validateCreateUser, createUserHandler);
authRouter.put("/users/:id", authMiddleware, requireRole("ADMIN"), auditMiddleware("UPDATE", "User"), validateUpdateUser, updateUserHandler);
authRouter.delete("/users/:id", authMiddleware, requireRole("ADMIN"), auditMiddleware("DELETE", "User"), deleteUserHandler);

export default authRouter;
