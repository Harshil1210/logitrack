import { Types, Document } from "mongoose";

export enum Role {
  Admin = "admin",
  User = "user",
}

export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: Role;
  googleId: string;
  mfaSecret?: string;
  mfaEnabled: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}
