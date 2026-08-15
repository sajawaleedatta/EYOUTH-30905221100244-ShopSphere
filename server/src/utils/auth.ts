import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

export const generateToken = (payload: JwtPayload): string => {
  const secret = getSecret();
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = getSecret();
  return jwt.verify(token, secret) as JwtPayload;
};
