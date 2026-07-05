import { Request, Response, NextFunction } from "express";
import { getAuditLogs } from "./audit.service";

export async function getAuditLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await getAuditLogs(page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
