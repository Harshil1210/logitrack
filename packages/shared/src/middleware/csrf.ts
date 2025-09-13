import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/appError";

// Simple CSRF protection using double submit cookie pattern
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests and OAuth callbacks
  if (req.method === 'GET' || req.path.includes('/google')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return next(new AppError('Invalid CSRF token', 403));
  }

  next();
};

// Generate CSRF token endpoint
export const generateCSRFToken = (req: Request, res: Response) => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  res.cookie('csrf-token', token, {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({ csrfToken: token });
};