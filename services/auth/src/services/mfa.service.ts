import userModel from "../models/user.model";
import { AppError } from "@logitrack/shared";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";

export const setupMFA = async (userId: string) => {
  const user = await userModel.findById(userId).select("email");

  if (!user) {
    throw new AppError("user not found", 404);
  }

  const secret = speakeasy.generateSecret({
    name: `node-auth ${user.email}`,
  });

  user.mfaSecret = secret.base32;
  user.mfaEnabled = true;
  await user.save();

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    message: "Scan the QR code using Google Authenticator app",
    qrcode: qrCodeUrl,
    manualEntry: secret.base32,
  };
};

export const verifyMFA = async (userId: string, totp: string) => {
  const user = await userModel
    .findById(userId)
    .select("+mfaSecret +mfaEnabled +email +role");

  if (!user || !user.mfaSecret) {
    throw new AppError("user not found or Mfa secret not found", 404);
  }

  const isVerified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token: totp,
    window: 1,
  });

  if (!isVerified) {
    throw new AppError("Invalid TOTP code", 401);
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
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};
