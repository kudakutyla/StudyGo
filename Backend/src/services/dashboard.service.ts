import { prisma } from "../config/database";

export const getDashboardStatsForUser = async (userId: string) => {
  const [total, pending, inProgress, completed, overdue, highPriority] = await Promise.all([
    prisma.assignment.count({ where: { userId } }),
    prisma.assignment.count({ where: { userId, status: "PENDING" } }),
    prisma.assignment.count({ where: { userId, status: "IN_PROGRESS" } }),
    prisma.assignment.count({ where: { userId, status: "COMPLETED" } }),
    prisma.assignment.count({
      where: {
        userId,
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.assignment.count({
      where: {
        userId,
        priority: "HIGH",
      },
    }),
  ]);

  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
    highPriority,
  };
};
