import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import mongoose from "mongoose";
import prisma from "./config/database";
import connectMongoDB from "./config/mongodb";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin/routes";
import reviewProxyRoutes from "./routes/review.proxy";
import internalRoutes from "./routes/internal.routes";
import { requestLogger, errorLogger } from "./middleware/requestLogger";

const app = express();

app.set("trust proxy", 1);

app.use(requestLogger);

const corsOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later." },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

void connectMongoDB();

app.get("/", (_req, res) => {
  res.json({ status: "ok", app: "Deci Techno API", version: "1.0.0" });
});

app.get("/api/health", async (_req, res) => {
  const checks: Record<string, string> = { server: "ok" };
  let dbOk = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    dbOk = false;
    checks.postgres = "error";
  }

  checks.mongodb =
    mongoose.connection.readyState === 1 ? "ok" : "unavailable";

  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewProxyRoutes);
app.use("/api/internal", internalRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorLogger);

export default app;
