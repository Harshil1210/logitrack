import Express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from '@logitrack/config';
import authRoutes from "./routes/auth.route";
import mfaRoutes from "./routes/mfa.routes";
import { globalErrorHandler, connectRedis } from "@logitrack/shared";
import passport from "passport";
import { connectDB } from "./config/db";
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger";

const app = Express();
const port = config.ports.auth;

app.use(cors());
app.use(cookieParser());
app.use(Express.json());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    service: "Authentication Service",
    version: "1.0.0",
    description: "Handles user authentication, registration, MFA, and Google OAuth",
    endpoints: ["/api/auth", "/api/mfa", "/docs"],
    status: "running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec))

app.use(globalErrorHandler);

app.listen(port, async () => {
  console.log(`🔐 Auth Service running at: http://localhost:${port}`);
  await connectDB();
  await connectRedis();
});
