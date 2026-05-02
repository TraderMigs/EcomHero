import { createServiceClient } from '@/lib/supabase/server'
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, ArrowRight } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminStat, AdminTable,
  AdminTableRow, AdminTableCell, AdminBadge, AdminEmpty,
  AdminButton, palette
} from '@/components/ui/AdminUI'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  pending: 'warning', processing: 'info', fulfilled: 'success',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'default',
}

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

  const totalRevenue = orderTotals?.reduce((s, o) => s + (o.total || 0), 0) || 0

  return (
    <AdminPage>
      <AdminPageHeader title="Dashboard" subtitle="Welcome back. Here's what's happening." />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <AdminStat label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="#22c55e"
          icon={<DollarSign size={15} />} />
        <AdminStat label="Orders" value={orderCount || 0} color="#6366f1"
          icon={<ShoppingCart size={15} />} />
        <AdminStat label="Customers" value={customerCount || 0} color="#f59e0b"
          icon={<Users size={15} />} />
        <AdminStat label="Products" value={productCount || 0} color="#06b6d4"
          icon={<Package size={15} />} />
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold" style={{ color: palette.text }}>Recent Orders</p>
          <a href="/admin/orders" className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: palette.textMuted }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = palette.text}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = palette.textMuted}>
            View all <ArrowRight size={11} />
          </a>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <AdminTable headers={['Order', 'Customer', 'Total', 'Status']}>
            {recentOrders.map(order => (
              <AdminTableRow key={order.id}>
                <AdminTableCell>
                  <span className="font-mono text-xs font-semibold" style={{ color: palette.textMuted }}>
                    #{order.order_number}
                  </span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="text-xs">{order.customer_email}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <span className="font-bold text-xs">${order.total?.toFixed(2)}</span>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={STATUS_VARIANT[order.status] || 'default'}>
                    {order.status}
                  </AdminBadge>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
        ) : (
          <div className="rounded-xl border py-12 text-center" style={{ borderColor: palette.border, background: palette.surface }}>
            <AdminEmpty
              icon={<TrendingUp size={18} />}
              title="No orders yet"
              subtitle="Share your store to start getting orders"
            />
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Add Product', href: '/admin/products/new' },
          { label: 'New Page', href: '/admin/pages/new' },
          { label: 'Discounts', href: '/admin/discounts' },
          { label: 'Settings', href: '/admin/settings' },
        ].map(link => (
          <a key={link.href} href={link.href}
            className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all group"
            style={{ background: palette.surface, borderColor: palette.border, color: palette.textMuted }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = palette.accent
              e.currentTarget.style.color = palette.text
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.borderColor = palette.border
              e.currentTarget.style.color = palette.textMuted
            }}>
            {link.label}
            <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </AdminPage>
  )
}
