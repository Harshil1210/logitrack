import { Request } from "express";

export enum Role {
  Admin = "admin",
  User = "user",
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
