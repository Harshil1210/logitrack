import Express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from '@logitrack/config';
import authRoutes from "./routes/auth.route";
import mfaRoutes from "./routes/mfa.routes";
import { globalErrorHandler } from "@logitrack/shared";
import { requireAuth } from "./middlewares/auth.middleware";
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

app.use("/api/auth", authRoutes);
app.use("/api/mfa", requireAuth, mfaRoutes);
app.use("/docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec))

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});
