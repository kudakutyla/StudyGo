import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: AnyZodObject, source: "body" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req[source] = schema.parse(req[source]);
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
