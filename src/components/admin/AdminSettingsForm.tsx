'use client'
import { useState, useEffect } from 'react'
import { StoreSettings } from '@/types'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'

interface Props { settings: StoreSettings | null }

const ACCENT_PRESETS = ['#ff4500','#e11d48','#7c3aed','#2563eb','#059669','#d97706','#000000','#64748b']

type SettingsFormData = {
  store_name: string
  tagline: string
  primary_color: string
  secondary_color: string
  accent_color: string
  contact_email: string
  support_email: string
  social_instagram: string
  social_tiktok: string
  social_facebook: string
  meta_title: string
  meta_description: string
  footer_text: string
  announcement_bar: string
  announcement_bar_active: boolean
  store_type: string
  stripe_publishable_key: string
  new_stripe_secret: string
  new_webhook_secret: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const ic = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"

export default function AdminSettingsForm({ settings }: Props) {
  const [data, setData] = useState<SettingsFormData>({
    store_name: settings?.store_name || '',
    tagline: settings?.tagline || '',
    primary_color: settings?.primary_color || '#000000',
    secondary_color: settings?.secondary_color || '#ffffff',
    accent_color: settings?.accent_color || '#ff4500',
    contact_email: settings?.contact_email || '',
    support_email: settings?.support_email || '',
    social_instagram: settings?.social_instagram || '',
    social_tiktok: settings?.social_tiktok || '',
    social_facebook: settings?.social_facebook || '',
    meta_title: settings?.meta_title || '',
    meta_description: settings?.meta_description || '',
    footer_text: settings?.footer_text || '',
    announcement_bar: settings?.announcement_bar || '',
    announcement_bar_active: settings?.announcement_bar_active || false,
    store_type: settings?.store_type || 'single',
    stripe_publishable_key: settings?.stripe_publishable_key || '',
    new_stripe_secret: '',
    new_webhook_secret: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof SettingsFormData, v: string | boolean) => {
    setData(d => {
      const next = { ...d, [k]: v }
      // Broadcast to live preview
      window.dispatchEvent(new CustomEvent('ecomhero:preview-update', {
        detail: { settings: { ...settings, ...next } }
      }))
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) toast.success('Settings saved!')
      else toast.error('Failed to save')
    } catch { toast.error('Error saving settings') }
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Store Settings</h1>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90"
          style={{ background: '#000' }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <Section title="Store Info">
        <Field label="Store Name">
          <input value={data.store_name} onChange={e => set('store_name', e.target.value)} className={ic} />
        </Field>
        <Field label="Tagline">
          <input value={data.tagline} onChange={e => set('tagline', e.target.value)} className={ic} />
        </Field>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="ann" checked={data.announcement_bar_active}
            onChange={e => set('announcement_bar_active', e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="ann" className="text-sm">Show announcement bar</label>
        </div>
        {data.announcement_bar_active && (
          <Field label="Announcement Text">
            <input value={data.announcement_bar} onChange={e => set('announcement_bar', e.target.value)}
              placeholder="Free shipping on orders over $50!" className={ic} />
          </Field>
        )}
      </Section>

      <Section title="Brand Colors">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.primary_color} onChange={e => set('primary_color', e.target.value)}
                className="w-9 h-9 rounded-lg border cursor-pointer" />
              <span className="text-xs font-mono text-gray-500">{data.primary_color}</span>
            </div>
          </Field>
          <Field label="Background Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.secondary_color} onChange={e => set('secondary_color', e.target.value)}
                className="w-9 h-9 rounded-lg border cursor-pointer" />
              <span className="text-xs font-mono text-gray-500">{data.secondary_color}</span>
            </div>
          </Field>
        </div>
        <Field label="Accent Color">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(c => (
              <button key={c} onClick={() => set('accent_color', c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${data.accent_color === c ? 'border-black scale-125' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
            <input type="color" value={data.accent_color} onChange={e => set('accent_color', e.target.value)}
              className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 cursor-pointer" />
          </div>
        </Field>
      </Section>

      <Section title="Contact & Social">
        <Field label="Contact Email">
          <input type="email" value={data.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="hello@store.com" className={ic} />
        </Field>
        <Field label="Support Email">
          <input type="email" value={data.support_email} onChange={e => set('support_email', e.target.value)} className={ic} />
        </Field>
        <Field label="Instagram Handle">
          <input value={data.social_instagram} onChange={e => set('social_instagram', e.target.value)} placeholder="yourhandle" className={ic} />
        </Field>
        <Field label="TikTok Handle">
          <input value={data.social_tiktok} onChange={e => set('social_tiktok', e.target.value)} placeholder="yourhandle" className={ic} />
        </Field>
        <Field label="Facebook Page">
          <input value={data.social_facebook} onChange={e => set('social_facebook', e.target.value)} className={ic} />
        </Field>
      </Section>

      <Section title="SEO">
        <Field label="Meta Title">
          <input value={data.meta_title} onChange={e => set('meta_title', e.target.value)} className={ic} />
        </Field>
        <Field label="Meta Description">
          <textarea value={data.meta_description} onChange={e => set('meta_description', e.target.value)}
            rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
        </Field>
        <Field label="Footer Text">
          <input value={data.footer_text} onChange={e => set('footer_text', e.target.value)}
            placeholder="© 2026 My Store. All rights reserved." className={ic} />
        </Field>
      </Section>

      <Section title="Stripe Payments">
        <Field label="Publishable Key">
          <input value={data.stripe_publishable_key} onChange={e => set('stripe_publishable_key', e.target.value)} placeholder="pk_live_xxx" className={ic} />
        </Field>
        <Field label="New Secret Key (leave blank to keep current)">
          <input type="password" value={data.new_stripe_secret} onChange={e => set('new_stripe_secret', e.target.value)}
            placeholder="sk_live_xxx" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none font-mono" />
        </Field>
        <Field label="New Webhook Secret (leave blank to keep current)">
          <input type="password" value={data.new_webhook_secret} onChange={e => set('new_webhook_secret', e.target.value)}
            placeholder="whsec_xxx" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none font-mono" />
        </Field>
      </Section>
    </div>
  )
}
