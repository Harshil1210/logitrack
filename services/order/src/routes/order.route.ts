import express, { Router } from "express";
import {
  createOrder,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByUser,
} from "../controllers/order.controller";
import { validateRequest } from "../middlewares/zod.middleware";
import { orderDto } from "../dto/order.dto";
import { orderCreationLimit } from "../middleware/orderRateLimit";

const router: Router = express.Router();

router.post("/", orderCreationLimit, validateRequest(orderDto), createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/status", updateOrderStatus);
router.get("/user/:userId", getOrdersByUser);

export default router;
