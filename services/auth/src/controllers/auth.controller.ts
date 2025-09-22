import { NextFunction, Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { generateTokenWithSession, logoutUser } from "../services/authService";
import { config } from "@logitrack/config";

const nodeEnv = config.nodeEnv

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    const data = await AuthService.register(
      email,
      password,
      role,
      firstName,
      lastName
    );

    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ err: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.login(email, password);

    if (data.mfaRequired) {
      res.status(200).json({
        tempToken: data.tempToken,
        mfaRequired: true,
      });
      return;
    }

    // Generate token with Redis session
    const sessionData = await generateTokenWithSession({
      _id: data.user._id,
      email: data.user.email,
      role: data.user.role
    });

    res.cookie("refresh_token", data.refreshToken, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 1000,
    });

    res.cookie("session_id", sessionData.sessionId, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 1000,
    });

    res.status(200).json({
      accessToken: sessionData.token,
      sessionId: sessionData.sessionId
    });
  } catch (err: any) {
    res.status(400).json({ err: err.message });
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token not found" });
      return;
    }

    const data = await AuthService.refreshToken(refreshToken);

    res.status(200).json({ token: data.accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const googleCallbackHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return (err: any, user: any) => {
    if (err || !user) {
      return res.redirect("/login");
    }

    const accessToken = generateAccessToken(
      user._id.toString(),
      user.role,
      user.email
    );
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  };
};

export const logoutHandler = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.session_id;
    
    if (sessionId) {
      await logoutUser(sessionId);
    }
    
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
    });
    
    res.clearCookie("session_id", {
      httpOnly: true,
      secure: nodeEnv === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
