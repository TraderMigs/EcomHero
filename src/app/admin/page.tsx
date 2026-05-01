import { createServiceClient } from '@/lib/supabase/server'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createServiceClient()

  const [
    { count: orderCount },
    { count: customerCount },
    { count: productCount },
    { data: recentOrders },
    { data: orderTotals },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('orders').select('total,financial_status').eq('financial_status', 'paid'),
  ])

  const totalRevenue = orderTotals?.reduce((sum, o) => sum + (o.total || 0), 0) || 0

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22c55e' },
    { label: 'Total Orders', value: orderCount || 0, icon: ShoppingCart, color: '#3b82f6' },
    { label: 'Customers', value: customerCount || 0, icon: Users, color: '#8b5cf6' },
    { label: 'Active Products', value: productCount || 0, icon: Package, color: '#f59e0b' },
  ]

  const statusColors: Record<string, string> = {
    pending: '#f59e0b', processing: '#3b82f6', fulfilled: '#22c55e',
    shipped: '#06b6d4', delivered: '#10b981', cancelled: '#ef4444', refunded: '#6b7280'
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: stat.color + '20' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h2 className="font-semibold text-sm">Recent Orders</h2>
          </div>
          <a href="/admin/orders" className="text-xs text-blue-600 hover:underline">View all</a>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-semibold text-sm">#{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-white"
                    style={{ background: statusColors[order.status] || '#6b7280' }}>
                    {order.status}
                  </span>
                  <span className="font-bold text-sm">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
            No orders yet. Share your store to get started!
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Add Product', href: '/admin/products/new', icon: Package },
          { label: 'New Page', href: '/admin/pages/new', icon: Package },
          { label: 'Discounts', href: '/admin/discounts', icon: Package },
          { label: 'Settings', href: '/admin/settings', icon: Package },
        ].map(link => (
          <a key={link.href} href={link.href}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-sm font-medium text-center">
            {link.label} →
          </a>
        ))}
      </div>
    </div>
  )
}
