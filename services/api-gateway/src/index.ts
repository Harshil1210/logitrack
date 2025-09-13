import express from "express";
import type { Request, Response } from "express";

import { createProxyMiddleware } from "http-proxy-middleware";
import type { Filter, Options, RequestHandler } from "http-proxy-middleware";
import cors from "cors";
import helmet from "helmet";
import { globalErrorHandler, requireAuth } from "@logitrack/shared";
import { config } from "@logitrack/config";
import { apiLimiter, authLimiter, publicLimiter } from "@logitrack/shared";

const app = express();
const port = process.env.PORT;

const AUTH_SERVICE_URL = config.services.auth;
const ORDERS_SERVICE_URL = config.services.order;
const NOTIFICATION_SERVICE_URL = config.services.notification;

const loginService = createProxyMiddleware<Request, Response>({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/auth": "",
  },
});

const orderService = createProxyMiddleware<Request, Response>({
  target: ORDERS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/orders": "",
  },
});

const notificationService = createProxyMiddleware<Request, Response>({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/notification": "",
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 API Gateway for Logistics & Content Management App");
});

app.use(
  cors({
    origin: "*",
  })
);
app.use(helmet());
app.use(publicLimiter);

// Public routes
app.use("/auth", authLimiter, loginService);

// Protected routes
app.use("/orders", apiLimiter, requireAuth, orderService);
app.use("/notification", apiLimiter, requireAuth, notificationService);

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
