import { NextFunction, Request, Response } from "express";
import { JWT_COOKIE_NAME, verifyToken } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.[JWT_COOKIE_NAME] as string | undefined;

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
