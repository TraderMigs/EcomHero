import { createServiceClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminTable, AdminTableRow,
  AdminTableCell, AdminEmpty, palette
} from '@/components/ui/AdminUI'

export default async function CustomersPage() {
  const supabase = createServiceClient()
  const { data: customers } = await supabase
    .from('customers').select('*').order('created_at', { ascending: false })

  return (
    <AdminPage>
      <AdminPageHeader title="Customers" subtitle={`${customers?.length || 0} total customers`} />
      {customers && customers.length > 0 ? (
        <AdminTable headers={['Customer', 'Orders', 'Total Spent', 'Joined']}>
          {customers.map(c => (
            <AdminTableRow key={c.id}>
              <AdminTableCell>
                <div>
                  <p className="text-xs font-semibold" style={{ color: palette.text }}>
                    {c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : '—'}
                  </p>
                  <p className="text-xs" style={{ color: palette.textMuted }}>{c.email}</p>
                </div>
              </AdminTableCell>
              <AdminTableCell><span className="text-xs">{c.total_orders}</span></AdminTableCell>
              <AdminTableCell><span className="text-xs font-bold">${(c.total_spent || 0).toFixed(2)}</span></AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>{new Date(c.created_at).toLocaleDateString()}</span>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty icon={<Users size={18} />} title="No customers yet" subtitle="Customers appear here after their first order" />
        </div>
      )}
    </AdminPage>
  )
}
