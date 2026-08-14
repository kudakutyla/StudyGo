import { Request, Response } from "express";
import { getDashboardStatsForUser } from "../services/dashboard.service";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await getDashboardStatsForUser(req.userId!);

  res.status(200).json({
    success: true,
    data: stats,
  });
};
