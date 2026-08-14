import { ZodError, ZodTypeAny } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodTypeAny, source: "body" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      Object.defineProperty(req, source, {
        value: parsed,
        configurable: true,
        writable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: error.issues[0]?.message ?? "Validation failed"
        });
        return;
      }
      next(error);
    }
  };
};
