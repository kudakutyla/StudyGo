import { Request, Response } from "express";
import { HttpError } from "../middleware/error.middleware";
import { loginUser, registerUser, getCurrentUserFromId } from "../services/auth.service";
import { JWT_COOKIE_NAME } from "../utils/jwt";

export const register = async (req: Request, res: Response): Promise<void> => {
  const user = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully. Please log in.",
    data: user,
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { token, user } = await loginUser(req.body);

  res.cookie(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: user,
  });
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(JWT_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await getCurrentUserFromId(req.userId);

  if (!user) {
    throw new HttpError(401, "Unauthorized");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};
