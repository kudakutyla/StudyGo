import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const JWT_COOKIE_NAME = "studygo_token";

export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } => {
  const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string };
  return { userId: payload.userId };
};
