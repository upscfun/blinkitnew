import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import { Order } from '../../types';
import toast from 'react-hot-toast';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:           { label: 'Pending',           color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:         { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700' },
  PACKING:           { label: 'Packing',           color: 'bg-purple-100 text-purple-700' },
  OUT_FOR_DELIVERY:  { label: 'Out for Delivery',  color: 'bg-orange-100 text-orange-700' },
  DELIVERED:         { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  CANCELLED:         { label: 'Cancelled',         color: 'bg-red-100 text-red-700' },
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => orderApi.getAll({ limit: 50, status: statusFilter || undefined }),
  });

  const orders: Order[] = data?.data?.data || [];

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm py-2">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Update Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => {
                  const sc = STATUS_CONFIG[order.status];
                  const o = order as Order & { user?: { name: string; email: string } };
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">#{order.id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{o.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{o.user?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.items.length} items</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">₹{order.total}</td>
                      <td className="px-4 py-3 text-gray-600">{order.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc?.color || 'bg-gray-100 text-gray-600'}`}>{sc?.label || order.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blink-yellow disabled:opacity-50"
                        >
                          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
