import express from "express";
import cors from "cors";
import { createServer } from "http";
import { connectDB } from "./config/db";
import orderRoutes from "./routes/order.route";
import productRoutes from "./routes/product.route";
import websocketRoutes from "./routes/websocket.route";
import { upload } from "./middlewares/upload.middleware";
import { config } from "@logitrack/config";
import { productUploadLimit } from "./middleware/orderRateLimit";
import { globalErrorHandler, connectRedis, createLogger, requestLogger, createWebSocketServer } from "@logitrack/shared";
import { errorLogger } from "./middleware/errorLogger";

const logger = createLogger('order-service');

const app = express();
const httpServer = createServer(app);
const port = config.ports.order;

// Create WebSocket server
export const io = createWebSocketServer(httpServer, 'order-service');

app.use(cors());
app.use(express.json());
app.use(requestLogger('order-service'));


app.use("/orders",orderRoutes);
app.use("/product", productRoutes);
app.use("/ws", websocketRoutes);

app.get("/", (req, res) => {
  res.json({
    service: "Order Service",
    version: "1.0.0",
    description: "Handles order management, product catalog, and file uploads",
    endpoints: ["/orders", "/product", "/upload"],
    status: "running"
  });
});

app.post("/upload", productUploadLimit, upload.single("photos"), function (req, res, next) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const file = req.file as Express.MulterS3.File;

  return res.status(200).json({
    message: "Upload successful",
    fileUrl: file.location,
    fileKey: file.key,
  });
});

app.use(errorLogger);
app.use(globalErrorHandler);

httpServer.listen(port, async () => {
  logger.info('Order Service starting', { port });
  await connectDB();
  await connectRedis();
  logger.info('Order Service ready', { 
    port, 
    endpoints: ['/orders', '/product', '/upload'],
    url: `http://localhost:${port}`,
    websocket: true
  });
});

// createPublicBucket()
