import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const stats = data?.data?.data;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: stats?.totalOrders ?? '—', icon: ShoppingBag, color: 'bg-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Products', value: stats?.totalProducts ?? '—', icon: Package, color: 'bg-blink-green', bg: 'bg-green-50' },
    { label: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toFixed(0)}` : '—', icon: TrendingUp, color: 'bg-orange-500', bg: 'bg-orange-50' },
  ];

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING:           { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED:         { label: 'Confirmed',        color: 'bg-blue-100 text-blue-700' },
    PACKING:           { label: 'Packing',          color: 'bg-purple-100 text-purple-700' },
    OUT_FOR_DELIVERY:  { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700' },
    DELIVERED:         { label: 'Delivered',        color: 'bg-green-100 text-green-700' },
    CANCELLED:         { label: 'Cancelled',        color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, here's what's happening</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`${card.bg} rounded-2xl p-5`}>
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        {stats?.ordersByStatus && (
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Orders by Status</h2>
            <div className="space-y-3">
              {stats.ordersByStatus.map((s: { status: string; _count: { id: number } }) => {
                const conf = statusMap[s.status];
                return (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${conf?.color || 'bg-gray-100 text-gray-600'}`}>
                      {conf?.label || s.status}
                    </span>
                    <span className="text-sm font-bold text-gray-700">{s._count.id}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {stats?.recentOrders && (
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {stats.recentOrders.map((o: { id: string; user: { name: string }; total: number; status: string; createdAt: string }) => {
                const conf = statusMap[o.status];
                return (
                  <div key={o.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.user.name}</p>
                      <p className="text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">₹{o.total}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${conf?.color || ''}`}>{conf?.label || o.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
