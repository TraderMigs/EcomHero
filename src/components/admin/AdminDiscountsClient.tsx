'use client'
import { useState } from 'react'
import { DiscountCode } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Tag, Trash2, Loader2 } from 'lucide-react'

interface Props { discounts: DiscountCode[] }

export default function AdminDiscountsClient({ discounts: initial }: Props) {
  const [discounts, setDiscounts] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', max_uses: '', expires_at: '' })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.code || !form.value) return
    setSaving(true)
    try {
      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, value: parseFloat(form.value), min_order_amount: parseFloat(form.min_order_amount) || 0, max_uses: form.max_uses ? parseInt(form.max_uses) : null }),
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
    <div className="flex flex-col gap-4">
      {/* Create */}
      {!creating ? (
        <button onClick={() => setCreating(true)}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
          style={{ background: '#000' }}>
          <Plus size={16} /> New Discount Code
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold mb-4">Create Discount Code</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none font-mono" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Value *</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percentage' ? '20 = 20% off' : '10 = $10 off'}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Min Order ($)</label>
              <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                placeholder="0 = no minimum"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Max Uses</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                placeholder="Leave blank = unlimited"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Expires</label>
              <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
              style={{ background: '#000' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : null} Create
            </button>
            <button onClick={() => setCreating(false)} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {discounts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Code','Type','Value','Uses','Status','Expires',''].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {discounts.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-bold">{d.code}</td>
                  <td className="px-6 py-4 capitalize">{d.type}</td>
                  <td className="px-6 py-4">{d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}</td>
                  <td className="px-6 py-4">{d.uses_count}{d.max_uses ? ` / ${d.max_uses}` : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => del(d.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <Tag size={48} className="mx-auto mb-4 opacity-30" />
            <p>No discount codes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
