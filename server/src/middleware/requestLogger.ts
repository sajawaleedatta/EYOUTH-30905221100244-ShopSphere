import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta: Record<string, unknown> = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
    } else {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, meta);
    }
  });

  next();
}

export function errorLogger(err: Error, _req: Request, res: Response, next: NextFunction): void {
  logger.error("Unhandled error", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  if (!res.headersSent) {
    res.status(500).json({ success: false, error: "Internal server error." });
  }

  next(err);
}
