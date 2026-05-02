'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, MapPin, Loader2, CheckCircle } from 'lucide-react'

interface Address {
  id: string; label: string; first_name: string; last_name: string
  address1: string; address2?: string; city: string; state: string
  zip: string; country: string; phone?: string; is_default: boolean
}

const BLANK = { label: 'Home', first_name: '', last_name: '', address1: '', address2: '', city: '', state: '', zip: '', country: 'US', phone: '', is_default: false }

const inputCls = "w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors focus:border-current bg-transparent"
const borderStyle = { borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(BLANK)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch('/api/account/addresses')
      .then(r => r.json())
      .then(d => { setAddresses(d.addresses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!form.address1 || !form.city || !form.zip) return
    setSaving(true)
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.address) {
        setAddresses(prev => form.is_default
          ? [data.address, ...prev.map(a => ({ ...a, is_default: false }))]
          : [...prev, data.address]
        )
        setShowForm(false)
        setForm(BLANK)
      }
    } finally { setSaving(false) }
  }

  const del = async (id: string) => {
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' })
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 opacity-30">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Saved Addresses</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: 'var(--brand-primary)' }}>
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border p-5 mb-5"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
          <p className="font-semibold text-sm mb-4">New Address</p>
          <div className="flex flex-col gap-3">
            <input value={form.label} onChange={e => set('label', e.target.value)}
              placeholder="Label (e.g. Home, Work)" className={inputCls} style={borderStyle} />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.first_name} onChange={e => set('first_name', e.target.value)}
                placeholder="First name" className={inputCls} style={borderStyle} />
              <input value={form.last_name} onChange={e => set('last_name', e.target.value)}
                placeholder="Last name" className={inputCls} style={borderStyle} />
            </div>
            <input value={form.address1} onChange={e => set('address1', e.target.value)}
              placeholder="Street address *" className={inputCls} style={borderStyle} />
            <input value={form.address2 || ''} onChange={e => set('address2', e.target.value)}
              placeholder="Apt, suite, etc. (optional)" className={inputCls} style={borderStyle} />
            <div className="grid grid-cols-3 gap-3">
              <input value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="City *" className={inputCls} style={borderStyle} />
              <input value={form.state} onChange={e => set('state', e.target.value)}
                placeholder="State *" className={inputCls} style={borderStyle} />
              <input value={form.zip} onChange={e => set('zip', e.target.value)}
                placeholder="ZIP *" className={inputCls} style={borderStyle} />
            </div>
            <input value={form.phone || ''} onChange={e => set('phone', e.target.value)}
              placeholder="Phone (optional)" className={inputCls} style={borderStyle} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_default}
                onChange={e => set('is_default', e.target.checked)} className="w-4 h-4 rounded" />
              Set as default address
            </label>
            <div className="flex gap-2 mt-1">
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: 'var(--brand-primary)' }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Save Address
              </button>
              <button onClick={() => { setShowForm(false); setForm(BLANK) }}
                className="px-4 py-2.5 text-sm opacity-40 hover:opacity-70">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 opacity-30 gap-3 text-center">
          <MapPin size={40} />
          <p className="font-semibold">No saved addresses</p>
          <p className="text-sm">Add an address for faster checkout</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {addresses.map(addr => (
            <div key={addr.id}
              className="relative p-4 rounded-2xl border"
              style={{ borderColor: addr.is_default ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
              {addr.is_default && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full absolute top-3 right-3"
                  style={{ background: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)', color: 'var(--brand-accent)' }}>
                  Default
                </span>
              )}
              <p className="font-semibold text-sm mb-1">{addr.label}</p>
              <p className="text-sm opacity-70">{addr.first_name} {addr.last_name}</p>
              <p className="text-sm opacity-70">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
              <p className="text-sm opacity-70">{addr.city}, {addr.state} {addr.zip}</p>
              {addr.phone && <p className="text-xs opacity-40 mt-1">{addr.phone}</p>}
              <button onClick={() => del(addr.id)}
                className="flex items-center gap-1 text-xs mt-3 opacity-30 hover:opacity-60 transition-opacity">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
