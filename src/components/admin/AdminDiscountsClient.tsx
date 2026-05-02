'use client'
import { useState } from 'react'
import { DiscountCode } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Tag, Trash2 } from 'lucide-react'
import { palette } from '@/components/ui/palette'
import {
  AdminPage, AdminPageHeader, AdminField, AdminInput,
  AdminSelect, AdminButton, AdminBadge, AdminEmpty, AdminTable,
  AdminTableRow, AdminTableCell
} from '@/components/ui/AdminUI'

interface Props { discounts: DiscountCode[] }

// Defined outside to prevent re-render on keystroke
function DarkCard({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: palette.surface, borderColor: palette.border }}>
      {title && (
        <div className="px-5 py-3 border-b" style={{ borderColor: palette.borderLight }}>
          <p className="text-sm font-semibold" style={{ color: palette.text }}>{title}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function AdminDiscountsClient({ discounts: initial }: Props) {
  const [discounts, setDiscounts] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' })
  const [saving, setSaving] = useState(false)

  const setForm2 = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.code || !form.value) return
    setSaving(true)
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          min_order_amount: parseFloat(form.min_order_amount) || 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        }),
      })
      const data = await res.json()
      if (data.discount) {
        setDiscounts(d => [data.discount, ...d])
        setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' })
        setCreating(false)
        toast.success('Discount code created!')
      }
    } catch { toast.error('Failed to create discount') }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    await fetch(`/api/discounts/${id}`, { method: 'DELETE' })
    setDiscounts(d => d.filter(x => x.id !== id))
    toast.success('Deleted')
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Discount Codes"
        subtitle="Manage promotional codes"
        action={
          !creating ? (
            <AdminButton variant="primary" size="sm" onClick={() => setCreating(true)} icon={<Plus size={13} />}>
              New Code
            </AdminButton>
          ) : undefined
        }
      />

      {/* Create form */}
      {creating && (
        <DarkCard title="New Discount Code">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <AdminField label="Code" required>
              <AdminInput value={form.code} onChange={v => setForm2('code', v.toUpperCase())} placeholder="SUMMER20" />
            </AdminField>
            <AdminField label="Type">
              <AdminSelect value={form.type} onChange={v => setForm2('type', v)}
                options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount ($)' }]} />
            </AdminField>
            <AdminField label="Value" required hint={form.type === 'percentage' ? '20 = 20% off' : '10 = $10 off'}>
              <AdminInput value={form.value} onChange={v => setForm2('value', v)} type="number" placeholder="0" />
            </AdminField>
            <AdminField label="Min Order ($)" hint="0 = no minimum">
              <AdminInput value={form.min_order_amount} onChange={v => setForm2('min_order_amount', v)} type="number" placeholder="0" />
            </AdminField>
            <AdminField label="Max Uses" hint="Leave blank = unlimited">
              <AdminInput value={form.max_uses} onChange={v => setForm2('max_uses', v)} type="number" placeholder="∞" />
            </AdminField>
            <AdminField label="Expires">
              <AdminInput value={form.expires_at} onChange={v => setForm2('expires_at', v)} type="date" />
            </AdminField>
          </div>
          <div className="flex gap-2">
            <AdminButton variant="primary" size="sm" onClick={save} loading={saving}>Create</AdminButton>
            <AdminButton variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</AdminButton>
          </div>
        </DarkCard>
      )}

      {/* List */}
      {discounts.length > 0 ? (
        <AdminTable headers={['Code', 'Type', 'Value', 'Uses', 'Expires', 'Status', '']}>
          {discounts.map(d => (
            <AdminTableRow key={d.id}>
              <AdminTableCell>
                <span className="font-mono font-bold text-xs" style={{ color: palette.accent }}>{d.code}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs capitalize">{d.type}</span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs font-semibold">
                  {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>
                  {d.uses_count}{d.max_uses ? ` / ${d.max_uses}` : ''}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>
                  {d.expires_at ? new Date(d.expires_at).toLocaleDateString() : '—'}
                </span>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant={d.is_active ? 'success' : 'default'}>
                  {d.is_active ? 'Active' : 'Off'}
                </AdminBadge>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <button onClick={() => del(d.id)} style={{ color: palette.danger }}>
                  <Trash2 size={13} />
                </button>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty
            icon={<Tag size={18} />}
            title="No discount codes yet"
            subtitle="Create your first promotional code"
            action={
              !creating ? (
                <button onClick={() => setCreating(true)} className="text-xs font-semibold" style={{ color: palette.accent }}>
                  Create Code →
                </button>
              ) : undefined
            }
          />
        </div>
      )}
    </AdminPage>
  )
}
