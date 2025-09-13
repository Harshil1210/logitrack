import userModel, { IUser } from "../models/user.model";
import { AppError } from "@logitrack/shared";
import jwt from "jsonwebtoken";
import {
  generateTempToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { config } from "@logitrack/config";

const refreshTokenSecret = config.jwt.refreshTokenSecret

export const register = async (
  email: string,
  password: string,
  role: string,
  firstName: string,
  lastName: string
) => {
  const user = await userModel.findOne({ email });
  if (user) {
    throw new AppError("User already exists", 400);
  }
  const newUser: IUser = await userModel.create({
    email,
    password,
    role,
    firstName,
    lastName,
  });
  const newUserObj = newUser.toObject();
  delete newUserObj.password;

  return { newUserObj };
};

export const login = async (email: string, password: string) => {
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("User not found", 400);
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 400);
  }

  if (user.mfaEnabled) {
    const tempToken = generateTempToken(user._id.toString());
    return { tempToken, mfaRequired: true };
  }

  const accessToken = generateAccessToken(
    user._id.toString(),
    user.role,
    user.email
  );
  const refreshToken = generateRefreshToken(user._id.toString());

  return {
    accessToken,
    refreshToken,
    mfaRequired: false,
    user: { id: user._id, email: user.email, role: user.role },
  };
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const decoded: any = jwt.verify(
      refreshToken,
      refreshTokenSecret
    );
    const userId = decoded.id;

    const user = await userModel.findById(userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.role,
      user.email
    );
    return { accessToken };
  } catch (error: any) {
    throw new AppError(error.message, 500);
  }
};
