import express, { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";

import { roleMiddleware } from "@logitrack/shared";

const router: Router = express.Router();

router.post("/create", roleMiddleware("admin"), createProduct);
router.patch("/update/:id", roleMiddleware("admin"), updateProduct);
router.get("/all", getAllProducts);
router.get("/products/:id", getProductById);

export default router;
