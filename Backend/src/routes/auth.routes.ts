import { Router } from "express";
import { getCurrentUser, login, logout, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", requireAuth, getCurrentUser);
