import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers["x-internal-token"];
  const expected = process.env.INTERNAL_TOKEN;

  if (!expected || !token || token !== expected) {
    res.status(401).json({ success: false, error: "Authentication required." });
    return;
  }

  const userId = req.headers["x-user-id"];
  if (!userId || typeof userId !== "string") {
    res.status(401).json({ success: false, error: "Invalid internal request." });
    return;
  }

  req.user = {
    userId,
    email: typeof req.headers["x-user-email"] === "string" ? req.headers["x-user-email"] : "",
    role: req.headers["x-user-role"] === "ADMIN" ? "ADMIN" : "CUSTOMER",
  };
  next();
};
