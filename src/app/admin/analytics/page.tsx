import { createServiceClient } from '@/lib/supabase/server'
import { BarChart2, TrendingUp, Eye, ShoppingCart } from 'lucide-react'
import { AdminPage, AdminPageHeader, AdminStat, AdminCard } from '@/components/ui/AdminUI'
import { palette } from '@/components/ui/palette'

export default async function AnalyticsPage() {
  const supabase = createServiceClient()
  const [{ data: orders }, { data: events }, { count: subscriberCount }] = await Promise.all([
    supabase.from('orders').select('total,created_at,financial_status').order('created_at'),
    supabase.from('analytics_events').select('event_type,page_slug,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('email_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const paidOrders = orders?.filter(o => o.financial_status === 'paid') || []
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
  const avgOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0
  const topPages = (events?.filter(e => e.event_type === 'page_view') || [])
    .reduce((acc: Record<string, number>, e) => { acc[e.page_slug || 'home'] = (acc[e.page_slug || 'home'] || 0) + 1; return acc }, {})
  const topPagesSorted = Object.entries(topPages).sort(([, a], [, b]) => b - a).slice(0, 5)

  return (
    <AdminPage>
      <AdminPageHeader title="Analytics" subtitle="Store performance overview" />
      <div className="grid grid-cols-2 gap-3">
        <AdminStat label="Revenue" value={`$${totalRevenue.toFixed(2)}`} color="#22c55e" icon={<TrendingUp size={15} />} />
        <AdminStat label="Paid Orders" value={paidOrders.length} color="#6366f1" icon={<ShoppingCart size={15} />} />
        <AdminStat label="Avg Order" value={`$${avgOrder.toFixed(2)}`} color="#f59e0b" icon={<BarChart2 size={15} />} />
        <AdminStat label="Subscribers" value={subscriberCount || 0} color="#06b6d4" icon={<Eye size={15} />} />
      </div>
      <AdminCard title="Top Pages">
        {topPagesSorted.length > 0 ? (
          <div className="flex flex-col gap-3">
            {topPagesSorted.map(([slug, views]) => (
              <div key={slug} className="flex items-center gap-3">
                <span className="text-xs font-mono w-20 truncate" style={{ color: palette.textMuted }}>/{slug}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: palette.border }}>
                  <div className="h-full rounded-full" style={{
                    width: `${Math.min(100, (views / (topPagesSorted[0]?.[1] || 1)) * 100)}%`,
                    background: palette.accent
                  }} />
                </div>
                <span className="text-xs font-semibold w-8 text-right" style={{ color: palette.textMuted }}>{views}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-6" style={{ color: palette.textDim }}>No page view data yet</p>
        )}
      </AdminCard>
    </AdminPage>
  )
}
