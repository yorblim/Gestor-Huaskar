import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado.");
  }
  return secret;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Token requerido." });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      id: number;
      email: string;
      role: "ADMIN" | "USER";
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token inválido o expirado." });
  }
}

export function requireRole(...roles: ("ADMIN" | "USER")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Acceso denegado." });
    }
    next();
  };
}
