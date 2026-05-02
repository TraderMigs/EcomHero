'use client'
import { useState } from 'react'
import { StoreSettings } from '@/types'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminCard, AdminField, AdminInput,
  AdminTextarea, AdminToggle, AdminButton, AdminColorPicker, AdminDivider, palette
} from '@/components/ui/AdminUI'

const ACCENT_PRESETS = ['#ff4500','#e11d48','#7c3aed','#2563eb','#059669','#d97706','#000000','#64748b']

type SettingsData = {
  store_name: string; tagline: string; primary_color: string; secondary_color: string
  accent_color: string; contact_email: string; support_email: string; social_instagram: string
  social_tiktok: string; social_facebook: string; meta_title: string; meta_description: string
  footer_text: string; announcement_bar: string; announcement_bar_active: boolean
  store_type: string; stripe_publishable_key: string; new_stripe_secret: string; new_webhook_secret: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <AdminCard title={title}><div className="flex flex-col gap-4">{children}</div></AdminCard>
}

export default function AdminSettingsForm({ settings }: { settings: StoreSettings | null }) {
  const [data, setData] = useState<SettingsData>({
    store_name: settings?.store_name || '', tagline: settings?.tagline || '',
    primary_color: settings?.primary_color || '#000000', secondary_color: settings?.secondary_color || '#ffffff',
    accent_color: settings?.accent_color || '#ff4500', contact_email: settings?.contact_email || '',
    support_email: settings?.support_email || '', social_instagram: settings?.social_instagram || '',
    social_tiktok: settings?.social_tiktok || '', social_facebook: settings?.social_facebook || '',
    meta_title: settings?.meta_title || '', meta_description: settings?.meta_description || '',
    footer_text: settings?.footer_text || '', announcement_bar: settings?.announcement_bar || '',
    announcement_bar_active: settings?.announcement_bar_active || false,
    store_type: settings?.store_type || 'single', stripe_publishable_key: settings?.stripe_publishable_key || '',
    new_stripe_secret: '', new_webhook_secret: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof SettingsData, v: string | boolean) => {
    setData(d => {
      const next = { ...d, [k]: v }
      window.dispatchEvent(new CustomEvent('ecomhero:preview-update', { detail: { settings: { ...settings, ...next } } }))
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/store/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (res.ok) toast.success('Settings saved!')
      else toast.error('Failed to save')
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Store Settings"
        action={<AdminButton variant="primary" size="sm" onClick={save} loading={saving} icon={<Save size={12} />}>Save</AdminButton>}
      />

      <Section title="Store Info">
        <AdminField label="Store Name" required>
          <AdminInput value={data.store_name} onChange={v => set('store_name', v)} />
        </AdminField>
        <AdminField label="Tagline">
          <AdminInput value={data.tagline} onChange={v => set('tagline', v)} />
        </AdminField>
        <AdminToggle label="Show Announcement Bar" checked={data.announcement_bar_active}
          onChange={v => set('announcement_bar_active', v)} />
        {data.announcement_bar_active && (
          <AdminField label="Announcement Text">
            <AdminInput value={data.announcement_bar} onChange={v => set('announcement_bar', v)}
              placeholder="Free shipping on orders over $50!" />
          </AdminField>
        )}
      </Section>

      <Section title="Brand Colors">
        <div className="grid grid-cols-2 gap-4">
          <AdminColorPicker label="Primary Color" value={data.primary_color} onChange={v => set('primary_color', v)} />
          <AdminColorPicker label="Background" value={data.secondary_color} onChange={v => set('secondary_color', v)} />
        </div>
        <AdminField label="Accent Color">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(c => (
              <button key={c} onClick={() => set('accent_color', c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: data.accent_color === c ? '#fff' : 'transparent', transform: data.accent_color === c ? 'scale(1.2)' : 'scale(1)' }} />
            ))}
            <input type="color" value={data.accent_color} onChange={e => set('accent_color', e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-dashed cursor-pointer opacity-0 absolute" />
          </div>
        </AdminField>
        {/* Live color preview */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: palette.border }}>
          <div className="h-1.5" style={{ background: data.primary_color }} />
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: data.secondary_color }}>
            <span className="font-bold text-xs" style={{ color: data.primary_color }}>{data.store_name || 'Your Store'}</span>
            <span className="text-xs px-3 py-1 rounded font-bold text-white" style={{ background: data.accent_color }}>Shop Now</span>
          </div>
        </div>
      </Section>

      <Section title="Contact & Social">
        <AdminField label="Contact Email">
          <AdminInput value={data.contact_email} onChange={v => set('contact_email', v)} placeholder="hello@store.com" type="email" />
        </AdminField>
        <AdminField label="Support Email">
          <AdminInput value={data.support_email} onChange={v => set('support_email', v)} type="email" />
        </AdminField>
        <AdminField label="Instagram Handle">
          <AdminInput value={data.social_instagram} onChange={v => set('social_instagram', v)} placeholder="yourhandle" />
        </AdminField>
        <AdminField label="TikTok Handle">
          <AdminInput value={data.social_tiktok} onChange={v => set('social_tiktok', v)} placeholder="yourhandle" />
        </AdminField>
        <AdminField label="Facebook Page">
          <AdminInput value={data.social_facebook} onChange={v => set('social_facebook', v)} />
        </AdminField>
      </Section>

      <Section title="SEO">
        <AdminField label="Meta Title">
          <AdminInput value={data.meta_title} onChange={v => set('meta_title', v)} />
        </AdminField>
        <AdminField label="Meta Description">
          <AdminTextarea value={data.meta_description} onChange={v => set('meta_description', v)} rows={3} />
        </AdminField>
        <AdminField label="Footer Text">
          <AdminInput value={data.footer_text} onChange={v => set('footer_text', v)} placeholder="© 2026 My Store" />
        </AdminField>
      </Section>

      <Section title="Stripe Payments">
        <AdminField label="Publishable Key">
          <AdminInput value={data.stripe_publishable_key} onChange={v => set('stripe_publishable_key', v)} placeholder="pk_live_xxx" />
        </AdminField>
        <AdminField label="New Secret Key" hint="Leave blank to keep current">
          <AdminInput value={data.new_stripe_secret} onChange={v => set('new_stripe_secret', v)} type="password" placeholder="sk_live_xxx" />
        </AdminField>
        <AdminField label="New Webhook Secret" hint="Leave blank to keep current">
          <AdminInput value={data.new_webhook_secret} onChange={v => set('new_webhook_secret', v)} type="password" placeholder="whsec_xxx" />
        </AdminField>
      </Section>

      <AdminButton variant="primary" size="lg" onClick={save} loading={saving} icon={<Save size={14} />}>
        Save Settings
      </AdminButton>
    </AdminPage>
  )
}
