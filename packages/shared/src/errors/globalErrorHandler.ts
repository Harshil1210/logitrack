import { NextFunction, Request, Response } from "express";
import { AppError } from "./appError";

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err instanceof AppError && err.statusCode) || 500;
  const message = err.message || "Internal Server Error";
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(statusCode).json({
    status: "error",
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
};