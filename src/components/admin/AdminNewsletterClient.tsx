'use client'
import { useState } from 'react'
import { Download, Mail, Users } from 'lucide-react'
import { palette } from '@/components/ui/palette'
import { AdminPage, AdminPageHeader, AdminStat, AdminTable, AdminTableRow, AdminTableCell, AdminEmpty } from '@/components/ui/AdminUI'

interface Subscriber { email: string; source: string; subscribed_at: string }

export default function AdminNewsletterClient({ count, recent }: { count: number; recent: Subscriber[] }) {
  const [exporting, setExporting] = useState(false)

  const exportCSV = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/newsletter')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally { setExporting(false) }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Newsletter"
        subtitle="Manage email subscribers"
        action={
          <button onClick={exportCSV} disabled={exporting || count === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
            style={{ background: palette.border, color: palette.text }}>
            <Download size={13} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <AdminStat label="Active Subscribers" value={count} color="#22c55e" icon={<Users size={15} />} />
        <AdminStat label="This Month" value={recent.filter(s => {
          const d = new Date(s.subscribed_at)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length} color="#6366f1" icon={<Mail size={15} />} />
      </div>

      {recent.length > 0 ? (
        <AdminTable headers={['Email', 'Source', 'Subscribed']}>
          {recent.map(s => (
            <AdminTableRow key={s.email}>
              <AdminTableCell>
                <span className="text-xs font-mono">{s.email}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs capitalize" style={{ color: palette.textMuted }}>{s.source}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>
                  {new Date(s.subscribed_at).toLocaleDateString()}
                </span>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty
            icon={<Mail size={18} />}
            title="No subscribers yet"
            subtitle="Newsletter signups appear here when customers subscribe via the store footer"
          />
        </div>
      )}
    </AdminPage>
  )
}
