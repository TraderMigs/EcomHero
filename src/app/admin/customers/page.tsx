import { createServiceClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'

export default async function CustomersPage() {
  const supabase = createServiceClient()
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Customers</h1>
        <p className="text-sm text-gray-500 mt-1">{customers?.length || 0} total customers</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {customers && customers.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Customer','Orders','Total Spent','Joined'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : '—'}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </td>
                  <td className="px-6 py-4">{c.total_orders}</td>
                  <td className="px-6 py-4 font-semibold">${(c.total_spent || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p>No customers yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
