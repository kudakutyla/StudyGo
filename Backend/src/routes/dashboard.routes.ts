import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.use(requireAuth);
dashboardRoutes.get("/stats", getDashboardStats);
