import { Types } from "mongoose";
import { Request } from "express";

export interface OrderItem {
  productId: Types.ObjectId;
  quantity: number;
  sub_total: number;
}

export interface OrderData {
  userId: string;
  items: OrderItem[];
  deliveryAddress: string;
  scheduledDate: Date;
}

export interface CreateProductWithFile {
  body: any;
  fileKey?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

export interface OrderUpdateEvent {
  orderId: string;
  userId: string;
  userEmail: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  previousStatus?: string;
  timestamp: string;
  orderDetails?: {
    items: string[];
    totalAmount: number;
  };
}