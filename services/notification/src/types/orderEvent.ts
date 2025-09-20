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