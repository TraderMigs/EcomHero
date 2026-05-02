'use client'
import { useState, useCallback } from 'react'
import { StoreSettings } from '@/types'
import toast from 'react-hot-toast'
import { Save, Upload, X, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
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
  store_type: string; stripe_publishable_key: string; new_stripe_secret: string
  new_webhook_secret: string; logo_url: string; favicon_url: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <AdminCard title={title}><div className="flex flex-col gap-4">{children}</div></AdminCard>
}

// Reusable image upload field
function ImageUploadField({
  label, hint, value, onChange, previewSize = 'rect'
}: {
  label: string
  hint: string
  value: string
  onChange: (url: string) => void
  previewSize?: 'rect' | 'square'
}) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      if (url) onChange(url)
      else toast.error('Upload failed')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: false, maxFiles: 1
  })

  return (
    <AdminField label={label} hint={hint}>
      <div className="flex items-start gap-4">
        {/* Drop zone */}
        <div {...getRootProps()}
          className="flex-1 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all"
          style={{
            borderColor: isDragActive ? palette.accent : palette.border,
            background: isDragActive ? palette.accentDim : 'transparent',
          }}>
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-xs py-1" style={{ color: palette.textMuted }}>
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload size={16} style={{ color: palette.textDim }} />
              <p className="text-xs" style={{ color: palette.textMuted }}>
                {isDragActive ? 'Drop here' : 'Drag & drop or click'}
              </p>
              <p className="text-xs" style={{ color: palette.textDim }}>PNG, JPG, SVG, WebP</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {value ? (
          <div className="relative shrink-0">
            <div
              className="rounded-lg overflow-hidden border flex items-center justify-center"
              style={{
                width: previewSize === 'square' ? '56px' : '120px',
                height: '56px',
                background: palette.border,
                borderColor: palette.borderLight,
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="" className="max-w-full max-h-full object-contain p-1" />
            </div>
            <button
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: palette.danger }}>
              <X size={10} color="#fff" />
            </button>
          </div>
        ) : (
          <div
            className="rounded-lg border shrink-0 flex items-center justify-center"
            style={{
              width: previewSize === 'square' ? '56px' : '120px',
              height: '56px',
              background: palette.border,
              borderColor: palette.borderLight,
            }}>
            <span className="text-xs" style={{ color: palette.textDim }}>
              {previewSize === 'square' ? '🌐' : '🖼️'}
            </span>
          </div>
        )}
      </div>
    </AdminField>
  )
}

export default function AdminSettingsForm({ settings }: { settings: StoreSettings | null }) {
  const [data, setData] = useState<SettingsData>({
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
    logo_url: settings?.logo_url || '',
    favicon_url: settings?.favicon_url || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof SettingsData, v: string | boolean) => {
    setData(d => {
      const next = { ...d, [k]: v }
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
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Store Settings"
        action={
          <AdminButton variant="primary" size="sm" onClick={save} loading={saving} icon={<Save size={12} />}>
            Save
          </AdminButton>
        }
      />

      {/* Brand Identity */}
      <Section title="Brand Identity">
        <AdminField label="Store Name" required>
          <AdminInput value={data.store_name} onChange={v => set('store_name', v)} />
        </AdminField>
        <AdminField label="Tagline">
          <AdminInput value={data.tagline} onChange={v => set('tagline', v)} />
        </AdminField>
        <AdminDivider />
        <ImageUploadField
          label="Store Logo"
          hint="Shown in header. Recommended: SVG or PNG with transparent background, max 400×120px."
          value={data.logo_url}
          onChange={v => set('logo_url', v)}
          previewSize="rect"
        />
        <ImageUploadField
          label="Favicon"
          hint="Browser tab icon. Recommended: square PNG or ICO, 32×32px or 64×64px."
          value={data.favicon_url}
          onChange={v => set('favicon_url', v)}
          previewSize="square"
        />
      </Section>

      {/* Announcement */}
      <Section title="Announcement Bar">
        <AdminToggle
          label="Show Announcement Bar"
          checked={data.announcement_bar_active}
          onChange={v => set('announcement_bar_active', v)}
        />
        {data.announcement_bar_active && (
          <AdminField label="Announcement Text">
            <AdminInput
              value={data.announcement_bar}
              onChange={v => set('announcement_bar', v)}
              placeholder="Free shipping on orders over $50!"
            />
          </AdminField>
        )}
      </Section>

      {/* Brand Colors */}
      <Section title="Brand Colors">
        <div className="grid grid-cols-2 gap-4">
          <AdminColorPicker label="Primary Color" value={data.primary_color} onChange={v => set('primary_color', v)} />
          <AdminColorPicker label="Background" value={data.secondary_color} onChange={v => set('secondary_color', v)} />
        </div>
        <AdminField label="Accent Color">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(c => (
              <button key={c} onClick={() => set('accent_color', c)}
                className="w-8 h-8 rounded-full transition-all border-2"
                style={{
                  background: c,
                  borderColor: data.accent_color === c ? '#fff' : 'transparent',
                  transform: data.accent_color === c ? 'scale(1.2)' : 'scale(1)',
                }} />
            ))}
            <div className="relative">
              <input type="color" value={data.accent_color} onChange={e => set('accent_color', e.target.value)}
                className="absolute inset-0 w-8 h-8 rounded-full opacity-0 cursor-pointer" />
              <div className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: palette.border }}>
                <span className="text-xs" style={{ color: palette.textDim }}>+</span>
              </div>
            </div>
          </div>
        </AdminField>

        {/* Live color + logo preview */}
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: palette.border }}>
          <div className="h-1" style={{ background: data.primary_color }} />
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: data.secondary_color }}>
            {data.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo_url} alt="logo" className="h-7 object-contain max-w-[120px]" />
            ) : (
              <span className="font-bold text-sm" style={{ color: data.primary_color }}>
                {data.store_name || 'Your Store'}
              </span>
            )}
            <span className="text-xs px-3 py-1.5 rounded font-bold text-white"
              style={{ background: data.accent_color }}>
              Shop Now
            </span>
          </div>
        </div>
      </Section>

      {/* Contact & Social */}
      <Section title="Contact & Social">
        <AdminField label="Contact Email">
          <AdminInput value={data.contact_email} onChange={v => set('contact_email', v)}
            placeholder="hello@store.com" type="email" />
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

      {/* SEO */}
      <Section title="SEO">
        <AdminField label="Meta Title">
          <AdminInput value={data.meta_title} onChange={v => set('meta_title', v)} />
        </AdminField>
        <AdminField label="Meta Description">
          <AdminTextarea value={data.meta_description} onChange={v => set('meta_description', v)} rows={3} />
        </AdminField>
        <AdminField label="Footer Text">
          <AdminInput value={data.footer_text} onChange={v => set('footer_text', v)}
            placeholder={`© ${new Date().getFullYear()} ${data.store_name || 'My Store'}`} />
        </AdminField>
      </Section>

      {/* Stripe */}
      <Section title="Stripe Payments">
        <AdminField label="Publishable Key">
          <AdminInput value={data.stripe_publishable_key} onChange={v => set('stripe_publishable_key', v)}
            placeholder="pk_live_xxx" />
        </AdminField>
        <AdminField label="New Secret Key" hint="Leave blank to keep current">
          <AdminInput value={data.new_stripe_secret} onChange={v => set('new_stripe_secret', v)}
            type="password" placeholder="sk_live_xxx" />
        </AdminField>
        <AdminField label="New Webhook Secret" hint="Leave blank to keep current">
          <AdminInput value={data.new_webhook_secret} onChange={v => set('new_webhook_secret', v)}
            type="password" placeholder="whsec_xxx" />
        </AdminField>
      </Section>

      <AdminButton variant="primary" size="lg" onClick={save} loading={saving} icon={<Save size={14} />}>
        Save Settings
      </AdminButton>
    </AdminPage>
  )
}
