import { Request, Response, NextFunction } from "express";
import { createAuditLog } from "../modules/audit/audit.service";

export function auditMiddleware(action: string, entity: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (res.statusCode < 400 && body?.success !== false) {
        const entityId = req.params.id || body?.data?.id || req.body?.id;
        createAuditLog({
          userId: req.user!.id,
          userName: req.user!.email,
          action,
          entity,
          entityId,
          details: JSON.stringify({ method: req.method, path: req.path }),
        });
      }
      return originalJson(body);
    };
    next();
  };
}
