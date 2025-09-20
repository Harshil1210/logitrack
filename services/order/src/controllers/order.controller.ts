import { NextFunction, Request, Response } from "express";
import {
  createOrderService,
  getAllOrdersService,
  getOrderByIdService,
  cancelOrderService,
  updateOrderStatusService,
  getOrdersByUserService,
} from "../services/order.service";
import { appEventEmitter } from "../events/eventEmitter";
import { sanitizeObjectId, sanitizeObject, AppError } from "@logitrack/shared";


export const createOrder = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const order = await createOrderService(req.body, userId, req.user.email);
    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: err.message });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await getAllOrdersService();
    res.status(200).json(orders);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const safeId = sanitizeObjectId(req.params.id);
    if (!safeId) {
      next(new AppError("Invalid order id", 400));
    }
    const order = await getOrderByIdService(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to get order", error: err.message });
  }
};

export const cancelOrder = async (req: any, res: Response) => {
  try {
    const order = await cancelOrderService(req.params.id, req.user.email);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order cancelled" });
  } catch (err: any) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: err.message,
    });
  }
};

export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    await updateOrderStatusService(req.params.id, req.body.status, req.user.email);
    res.status(200).json({ message: `Order marked as ${req.body.status}` });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: err.message });
  }
};

export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = await getOrdersByUserService(userId);
    res.status(200).json(orders);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to get user orders", error: err.message });
  }
};
