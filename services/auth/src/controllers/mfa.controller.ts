import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { setupMFA, verifyMFA } from "../services/mfa.service";
import { config } from "@logitrack/config";

const nodeEnv = config.nodeEnv;

export const setupMFAHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const data = await setupMFA(req.user.userId);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyMFAHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { totp } = req.body;

  if (!totp) {
    res.status(400).json({ message: "TOTP is required" });
    return;
  }

  try {
    const data = await verifyMFA(req.user.userId, totp);

    res.cookie("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "MFA verified successfully",
      accessToken: data.accessToken,
      user: data.user,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
