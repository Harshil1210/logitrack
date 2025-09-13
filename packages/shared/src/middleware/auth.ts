import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/appError";
import { AuthenticatedUser, AuthenticatedRequest } from "../types/auth";

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    next(new AppError("Authentication token is required", 401));
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next(new AppError("JWT secret not configured", 500));
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    next(new AppError(`Invalid authentication token: ${error.message}`, 401));
  }
};

export const roleMiddleware = (role: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || req.user.role !== role) {
      return next(
        new AppError("You do not have permission to access this resource", 403)
      );
    }
    next();
  };
};