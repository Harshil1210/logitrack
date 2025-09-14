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

const router: Router = express.Router();

router.post("/order", validateRequest(orderDto), createOrder);
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id", cancelOrder);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/orders/user/:userId", getOrdersByUser);

export default router;
