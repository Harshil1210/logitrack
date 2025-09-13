import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcrypt";

import { Role } from "../types/user";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: Role;
  googleId: string;
  mfaSecret?: string;
  mfaEnabled: boolean;
  firstName: string;
  lastName: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      validate: {
        validator: function (this: IUser, value: string) {
          if (!this.googleId) {
            return /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*\d).{6,}$/.test(value);
          }
          return true;
        },
        message:
          "Password must be at least 6 characters and include 1 uppercase letter, 1 number, and 1 special character",
      },
      select: false,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: Object.values(Role),
        message: "Role must be either admin or user",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("users", userSchema);
