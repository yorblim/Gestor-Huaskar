import { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError";

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const messages = result.error.issues.map((i: any) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return next(new AppError(messages, 400));
    }

    req.body = result.data;
    next();
  };
}
