import express from "express";
import type { Request, Response } from "express";

import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler, requireAuth, connectRedis } from "@logitrack/shared";
import { config } from "@logitrack/config";
import { redisApiLimiter, redisAuthLimiter, strictLimiter } from "@logitrack/shared";

const port = config.ports.gateway

const app = express();

const AUTH_SERVICE_URL = config.services.auth;
const ORDERS_SERVICE_URL = config.services.order;
const NOTIFICATION_SERVICE_URL = config.services.notification;

const loginService = createProxyMiddleware<Request, Response>({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: {
  //   "^/auth": "",
  // },
});

const orderService = createProxyMiddleware<Request, Response>({
  target: ORDERS_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: {
  //   "^/orders": "",
  // },
});

const notificationService = createProxyMiddleware<Request, Response>({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  // pathRewrite: {
  //   "^/notification": "",
  // },
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    service: "API Gateway",
    version: "1.0.0",
    description: "Central gateway routing requests to microservices",
    routes: {
      "/auth/*": AUTH_SERVICE_URL,
      "/orders/*": ORDERS_SERVICE_URL,
      "/notification/*": NOTIFICATION_SERVICE_URL
    },
    status: "running"
  });
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());
app.use(strictLimiter);

// Public routes
app.use("/auth", redisAuthLimiter, loginService);

// Protected routes
app.use("/orders", redisApiLimiter, orderService);
app.use("/notification", redisApiLimiter, requireAuth, notificationService);

app.use(globalErrorHandler);

app.listen(port, async () => {
  console.log(`🌐 API Gateway running at: http://localhost:${port}`);
  await connectRedis();
});
