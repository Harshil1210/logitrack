import express, { Router } from "express";
import {
  setupMFAHandler,
  verifyMFAHandler,
} from "../controllers/mfa.controller";

const router: Router = express.Router();

router.get("/setupMfa", setupMFAHandler);
router.post("/verifyMfa", verifyMFAHandler);

export default router;
