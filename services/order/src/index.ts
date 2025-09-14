import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import orderRoutes from "./routes/order.route";
import productRoutes from "./routes/product.route";
import { upload } from "./middlewares/upload.middleware";
import { config } from "@logitrack/config";

import { requireAuth, globalErrorHandler } from "@logitrack/shared";

const app = express();
const port = config.ports.order;

app.use(cors());
app.use(express.json());
app.use("/api", requireAuth, orderRoutes);
app.use("/api/product", productRoutes);

app.post("/upload", upload.single("photos"), function (req, res, next) {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const file = req.file as Express.MulterS3.File;

  return res.status(200).json({
    message: "Upload successful",
    fileUrl: file.location,
    fileKey: file.key,
  });
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});

// createPublicBucket()
