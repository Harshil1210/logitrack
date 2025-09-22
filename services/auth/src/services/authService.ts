import jwt from 'jsonwebtoken';
import { config } from '@logitrack/config';
import { createSession, deleteSession } from '@logitrack/shared';

interface LoginResponse {
  token: string;
  sessionId: string;
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export const generateTokenWithSession = async (user: { _id: string; email: string; role: string }): Promise<LoginResponse> => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  // Create JWT token
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });

  // Create Redis session
  const sessionId = await createSession(user._id, {
    email: user.email,
    role: user.role
  });

  return {
    token,
    sessionId,
    user: payload
  };
};

export const logoutUser = async (sessionId: string): Promise<void> => {
  await deleteSession(sessionId);
};