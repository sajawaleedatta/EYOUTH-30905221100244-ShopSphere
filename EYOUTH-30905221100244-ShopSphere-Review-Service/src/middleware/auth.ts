import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { AuthRequest, JwtPayload } from "../types/auth";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = getSecret();
  return jwt.verify(token, secret) as JwtPayload;
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Authentication required." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
};
