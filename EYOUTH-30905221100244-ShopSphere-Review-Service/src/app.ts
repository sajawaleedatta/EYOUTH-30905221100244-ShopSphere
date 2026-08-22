import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import reviewRoutes from "./routes/review.routes";
import connectMongoDB from "./config/mongodb";

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
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

void connectMongoDB();

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ShopSphere Review Service", version: "1.0.0" });
});

app.get("/api/health", (_req, res) => {
  const mongoose = require("mongoose");
  const mongoOk = mongoose.connection.readyState === 1;
  res.status(mongoOk ? 200 : 503).json({
    status: mongoOk ? "ok" : "degraded",
    service: "review-service",
    checks: { mongodb: mongoOk ? "ok" : "unavailable" },
  });
});

app.use("/api/reviews", reviewRoutes);

export default app;
