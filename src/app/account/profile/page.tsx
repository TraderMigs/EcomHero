'use client'
import { useState, useEffect } from 'react'
import { Loader2, Save, CheckCircle } from 'lucide-react'

export default function AccountProfilePage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => r.json())
      .then(d => {
        if (d.customer) setForm({
          first_name: d.customer.first_name || '',
          last_name: d.customer.last_name || '',
          phone: d.customer.phone || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
      else setError('Failed to save changes')
    } catch { setError('Something went wrong') }
    finally { setSaving(false) }
  }

  const inputCls = "w-full px-4 py-3 text-sm border rounded-xl outline-none transition-colors focus:border-current bg-transparent"

  if (loading) return (
    <div className="flex items-center justify-center py-20 opacity-30">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Profile</h1>

      <div className="flex flex-col gap-5 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest opacity-40 block mb-1.5">First Name</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              className={inputCls}
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest opacity-40 block mb-1.5">Last Name</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              className={inputCls}
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest opacity-40 block mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
            className={inputCls}
            style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }} />
        </div>

        {error && (
          <p className="text-xs font-medium px-3 py-2 rounded-lg"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
            {error}
          </p>
        )}

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 w-fit"
          style={{ background: 'var(--brand-primary)' }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
