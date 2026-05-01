import { createServiceClient } from '@/lib/supabase/server'
import { BarChart2, TrendingUp, Eye, ShoppingCart } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = createServiceClient()

  const [
    { data: orders },
    { data: events },
    { count: subscriberCount },
  ] = await Promise.all([
    supabase.from('orders').select('total,created_at,financial_status').order('created_at'),
    supabase.from('analytics_events').select('event_type,page_slug,created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('email_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const paidOrders = orders?.filter(o => o.financial_status === 'paid') || []
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrder = paidOrders.length ? totalRevenue / paidOrders.length : 0

  const pageViews = events?.filter(e => e.event_type === 'page_view') || []
  const topPages = pageViews.reduce((acc: Record<string, number>, e) => {
    const slug = e.page_slug || 'home'
    acc[slug] = (acc[slug] || 0) + 1
    return acc
  }, {})

  const topPagesSorted = Object.entries(topPages).sort(([, a], [, b]) => b - a).slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Store performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: '#22c55e' },
          { label: 'Paid Orders', value: paidOrders.length, icon: ShoppingCart, color: '#3b82f6' },
          { label: 'Avg Order Value', value: `$${avgOrder.toFixed(2)}`, icon: BarChart2, color: '#8b5cf6' },
          { label: 'Email Subscribers', value: subscriberCount || 0, icon: Eye, color: '#f59e0b' },
        ].map(stat => (
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

      {/* Top Pages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Top Pages</h2>
        </div>
        {topPagesSorted.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {topPagesSorted.map(([slug, views]) => (
              <div key={slug} className="px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-medium">/{slug}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (views / (topPagesSorted[0]?.[1] || 1)) * 100)}%`, background: 'var(--brand-accent)' }} />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{views}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No page view data yet</div>
        )}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Recent Events</h2>
        </div>
        {events && events.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {events.slice(0, 10).map(e => (
              <div key={`${e.event_type}-${e.created_at}`} className="px-6 py-3 flex items-center justify-between text-sm">
                <span className="font-medium">{e.event_type}</span>
                <span className="text-gray-400 text-xs">{new Date(e.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No events yet</div>
        )}
      </div>
    </div>
  )
}
