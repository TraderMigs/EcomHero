import { createServiceClient } from '@/lib/supabase/server'
import { ShoppingCart } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminTable, AdminTableRow,
  AdminTableCell, AdminBadge, AdminEmpty, palette
} from '@/components/ui/AdminUI'

const STATUS_V: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  pending: 'warning', processing: 'info', fulfilled: 'success',
  shipped: 'info', delivered: 'success', cancelled: 'danger', refunded: 'default',
}
const FULFILLMENT_V: Record<string, 'warning' | 'success' | 'default'> = {
  unfulfilled: 'warning', partial: 'warning', fulfilled: 'success', restocked: 'default',
}

export default async function OrdersPage() {
  const supabase = createServiceClient()
  const { data: orders } = await supabase
    .from('orders').select('*').order('created_at', { ascending: false })

  return (
    <AdminPage>
      <AdminPageHeader title="Orders" subtitle={`${orders?.length || 0} total orders`} />
      {orders && orders.length > 0 ? (
        <AdminTable headers={['Order', 'Date', 'Customer', 'Total', 'Status', 'Fulfillment']}>
          {orders.map(o => (
            <AdminTableRow key={o.id}>
              <AdminTableCell>
                <span className="font-mono text-xs font-bold" style={{ color: palette.text }}>#{o.order_number}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>{new Date(o.created_at).toLocaleDateString()}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs">{o.customer_email}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs font-bold">${o.total?.toFixed(2)}</span>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant={STATUS_V[o.status] || 'default'}>{o.status}</AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant={FULFILLMENT_V[o.fulfillment_status] || 'default'}>{o.fulfillment_status}</AdminBadge>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty icon={<ShoppingCart size={18} />} title="No orders yet" subtitle="Orders will appear here once customers start purchasing" />
        </div>
      )}
    </AdminPage>
  )
}
