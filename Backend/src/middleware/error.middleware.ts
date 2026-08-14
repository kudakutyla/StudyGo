import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: "Route not found" });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  console.error("Unhandled server error:", err);
  res.status(500).json({ success: false, message: "Something went wrong." });
};
