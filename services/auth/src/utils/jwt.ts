import jwt from "jsonwebtoken";
import { AppError } from "@logitrack/shared";
import { config } from "@logitrack/config";
import { Role } from "../types/user";

const { secret, refreshTokenSecret } = config.jwt;

export const generateAccessToken = (
  userId: string,
  role: Role,
  email: string
) => {
  return jwt.sign({ userId, role, email }, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, refreshTokenSecret, {
    expiresIn: "7d",
  });
};

export const generateTempToken = (userId: string) => {
  return jwt.sign({ userId }, secret, {
    expiresIn: "5m",
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }
};
