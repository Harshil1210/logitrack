import { redisClient } from '../lib/redis';

const DEFAULT_TTL = 60 * 60; // 1 hour

export const setCache = async (key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> => {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};

export const deleteCache = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const cacheExists = async (key: string): Promise<boolean> => {
  return (await redisClient.exists(key)) === 1;
};

// Product cache helpers
export const cacheProduct = async (productId: string, product: any): Promise<void> => {
  await setCache(`product:${productId}`, product, 30 * 60); // 30 minutes
};

export const getCachedProduct = async (productId: string): Promise<any | null> => {
  return await getCache(`product:${productId}`);
};

// Order cache helpers
export const cacheUserOrders = async (userId: string, orders: any[]): Promise<void> => {
  await setCache(`user:${userId}:orders`, orders, 10 * 60); // 10 minutes
};

export const getCachedUserOrders = async (userId: string): Promise<any[] | null> => {
  return await getCache(`user:${userId}:orders`);
};