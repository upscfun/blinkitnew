import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, MapPin, CreditCard, Clock, XCircle } from 'lucide-react';
import { orderApi } from '../api/order.api';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed', CONFIRMED: 'Confirmed', PACKING: 'Packing',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};
const STATUS_ICONS: Record<string, string> = {
  PENDING: '📋', CONFIRMED: '✅', PACKING: '📦', OUT_FOR_DELIVERY: '🚴', DELIVERED: '🎉', CANCELLED: '❌',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id!),
    refetchInterval: 30000,
  });

  const order = data?.data?.data;

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(id!);
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order cancelled');
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3 mb-6" /><div className="card p-6"><div className="h-4 bg-gray-200 rounded w-2/3" /></div></div>;

  if (!order) return <div className="text-center py-20"><p className="text-gray-400">Order not found</p><Link to="/orders" className="btn-primary mt-4 inline-block">My Orders</Link></div>;

  const isCancelled = order.status === 'CANCELLED';
  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ChevronLeft size={16} /> My Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <div className="text-center">
          <span className="text-3xl">{STATUS_ICONS[order.status]}</span>
          <p className="text-xs font-semibold text-gray-600 mt-1">{STATUS_LABELS[order.status]}</p>
        </div>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-5 mb-4">
          {order.estimatedTime && order.status !== 'DELIVERED' && (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5 mb-4">
              <Clock size={14} className="text-blink-green" />
              <span className="text-sm font-semibold text-blink-green">Estimated delivery in {order.estimatedTime} min</span>
            </div>
          )}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-3.5 h-1 bg-gray-200 -z-0">
              <div className="h-full bg-blink-green transition-all duration-500"
                style={{ width: `${stepIndex >= 0 ? (stepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 transition-all ${i <= stepIndex ? 'bg-blink-green border-blink-green text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                  {i <= stepIndex ? '✓' : '○'}
                </div>
                <span className="text-xs text-gray-500 text-center hidden sm:block max-w-[60px] leading-tight">{STATUS_LABELS[step]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3">Order Items</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-800">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blink-green" /> Delivery Address</h2>
        <p className="text-sm font-medium text-gray-700">{order.address.label}</p>
        <p className="text-sm text-gray-600">{order.address.street}</p>
        <p className="text-sm text-gray-500">{order.address.city}, {order.address.state} – {order.address.pincode}</p>
      </div>

      {/* Bill */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-gray-500" /> Bill Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-blink-green"><span>Discount</span><span>-₹{order.discount}</span></div>}
          <div className="flex justify-between text-gray-600"><span>Delivery</span><span className={order.deliveryFee === 0 ? 'text-blink-green' : ''}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100"><span>Total Paid</span><span>₹{order.total}</span></div>
          <p className="text-xs text-gray-400">Payment: {order.paymentMethod}</p>
        </div>
      </div>

      {/* Cancel */}
      {['PENDING', 'CONFIRMED'].includes(order.status) && (
        <button onClick={handleCancel} disabled={cancelling}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-500 border-2 border-red-100 rounded-xl hover:bg-red-50 transition-colors">
          <XCircle size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}
