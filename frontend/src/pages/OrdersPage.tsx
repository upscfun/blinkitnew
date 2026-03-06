import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderApi } from '../api/order.api';
import { Order } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:           { label: 'Pending',           color: 'text-yellow-700', bg: 'bg-yellow-100' },
  CONFIRMED:         { label: 'Confirmed',         color: 'text-blue-700',   bg: 'bg-blue-100' },
  PACKING:           { label: 'Packing',           color: 'text-purple-700', bg: 'bg-purple-100' },
  OUT_FOR_DELIVERY:  { label: 'Out for Delivery',  color: 'text-orange-700', bg: 'bg-orange-100' },
  DELIVERED:         { label: 'Delivered',         color: 'text-green-700',  bg: 'bg-green-100' },
  CANCELLED:         { label: 'Cancelled',         color: 'text-red-700',    bg: 'bg-red-100' },
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderApi.getMyOrders(),
  });

  const orders: Order[] = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={36} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1">Start shopping to see your orders here</p>
          <Link to="/" className="btn-primary mt-4 inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blink-yellow/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package size={22} className="text-blink-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-800 text-sm">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color} flex-shrink-0`}>{sc.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
