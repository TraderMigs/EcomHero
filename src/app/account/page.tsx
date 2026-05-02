import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#f59e0b18', text: '#d97706' },
  processing: { bg: '#3b82f618', text: '#2563eb' },
  fulfilled:  { bg: '#22c55e18', text: '#16a34a' },
  shipped:    { bg: '#8b5cf618', text: '#7c3aed' },
  delivered:  { bg: '#22c55e18', text: '#16a34a' },
  cancelled:  { bg: '#ef444418', text: '#dc2626' },
  refunded:   { bg: '#6b728018', text: '#4b5563' },
}

export default async function AccountOrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const service = createServiceClient()
  const { data: customer } = await service
    .from('customers').select('id').eq('auth_user_id', user.id).single()

  const { data: orders } = customer
    ? await service.from('orders').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>My Orders</h1>

      {!orders?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-4">
          <Package size={48} />
          <p className="font-semibold">No orders yet</p>
          <a href="/" className="text-sm underline">Start shopping</a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending
            return (
              <Link key={order.id} href={`/order/${order.order_number}`}
                className="flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md group"
                style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">#{order.order_number}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-40">
                    {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}
                    {order.line_items?.length || 0} item{(order.line_items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                  {order.tracking_number && (
                    <p className="text-xs" style={{ color: 'var(--brand-accent)' }}>
                      Tracking: {order.tracking_number}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">${order.total?.toFixed(2)}</span>
                  <ChevronRight size={16} className="opacity-30 group-hover:opacity-60 transition-opacity" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
