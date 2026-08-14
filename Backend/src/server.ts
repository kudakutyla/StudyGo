import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    app.listen(env.PORT, () => {
      console.log(`StudyGo API running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
