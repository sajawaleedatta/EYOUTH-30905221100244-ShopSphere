import "dotenv/config";
import prisma from "./config/database";
import connectMongoDB from "./config/mongodb";
import app from "./app";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected via Prisma");
  } catch (error) {
    logger.error("PostgreSQL connection error", { error: String(error) });
  }

  await connectMongoDB();

  app.listen(PORT, () => {
    logger.info("Server started", { port: PORT, env: process.env.NODE_ENV || "development" });
  });
};

start();
