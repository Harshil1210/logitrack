import { redisClient } from '../lib/redis';

const SESSION_PREFIX = 'session:';
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days

interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
}

export const createSession = async (userId: string, sessionData: Omit<SessionData, 'userId' | 'createdAt'>): Promise<string> => {
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const key = SESSION_PREFIX + sessionId;
  
  await redisClient.setEx(key, DEFAULT_TTL, JSON.stringify({
    userId,
    ...sessionData,
    createdAt: new Date().toISOString()
  }));
  
  return sessionId;
};

export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  const key = SESSION_PREFIX + sessionId;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const key = SESSION_PREFIX + sessionId;
  await redisClient.del(key);
};

export const refreshSession = async (sessionId: string): Promise<void> => {
  const key = SESSION_PREFIX + sessionId;
  await redisClient.expire(key, DEFAULT_TTL);
};