import {
  register,
  login,
  refreshTokenHandler,
  logoutHandler,
  googleCallbackHandler,
} from "../controllers/auth.controller";
import express, { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { validateRequest } from "../middlewares/zod.middleware";
import { loginSchema, registerSchema } from "../dto/auth.dto";
import { csrfProtection, generateCSRFToken } from "@logitrack/shared";

const router: Router = express.Router();

router.get("/csrf-token", generateCSRFToken);

router.post(
  "/register",
  csrfProtection,
  validateRequest(registerSchema),
  register
);
router.post("/login", csrfProtection, validateRequest(loginSchema), login);
router.get("/refresh-token", refreshTokenHandler);
router.get("/logout", logoutHandler);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { failureRedirect: "/login", session: false },
      googleCallbackHandler(req, res, next)
    )(req, res, next);
  }
);
export default router;
