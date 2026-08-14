import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { authRoutes } from "./routes/auth.routes";
import { assignmentRoutes } from "./routes/assignment.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "StudyGo API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
