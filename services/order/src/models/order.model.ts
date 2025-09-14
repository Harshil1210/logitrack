import mongoose, { Schema, Types, Document } from "mongoose";

export enum OrderStatus {
  PLACED = "PLACED",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

interface OrderItem {
  productId: Types.ObjectId;
  quantity: number;
  sub_total: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    items: [{ productId: Types.ObjectId, quantity: Number, sub_total: Number }],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: String,
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PLACED,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
