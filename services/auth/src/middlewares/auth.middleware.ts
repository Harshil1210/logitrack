import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@logitrack/shared";
import { AuthenticatedUser } from "../types/user";
import { config } from "@logitrack/config";

const jwtSecret = config.jwt.secret;

export interface AuthenticatedRequest extends Request {
  user?: any;
}

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
    if (token) {
      const decoded = jwt.verify(token, jwtSecret) as AuthenticatedUser;
      req.user = decoded;
      next();
      return;
    }
  } catch (error: any) {
    next(new AppError(`Invalid authentication token :${error.message}`, 401));
    return;
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
