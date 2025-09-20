// Map internal order statuses to notification statuses
export const mapOrderStatus = (internalStatus: string): 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' => {
  const statusMap: { [key: string]: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' } = {
    'PLACED': 'confirmed',
    'DISPATCHED': 'shipped', 
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled'
  };
  
  return statusMap[internalStatus] || 'pending';
};