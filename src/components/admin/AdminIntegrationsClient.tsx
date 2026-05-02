'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ExternalLink, CheckCircle } from 'lucide-react'
import { palette } from '@/components/ui/palette'
import {
  AdminPage, AdminPageHeader, AdminField, AdminInput,
  AdminButton, AdminToggle
} from '@/components/ui/AdminUI'

interface Props {
  settings: { pod_provider?: string; pod_shop_id?: string; stripe_publishable_key?: string } | null
}

const POD_OPTIONS = [
  { value: 'none', label: 'None — I manage my own inventory', icon: '📦', desc: 'Manual fulfillment' },
  { value: 'printful', label: 'Printful', icon: '🖨️', desc: 'Print-on-demand & fulfillment', docsUrl: 'https://www.printful.com/api' },
  { value: 'printify', label: 'Printify', icon: '🎨', desc: '100+ print providers globally', docsUrl: 'https://developers.printify.com' },
]

function DarkCard({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: palette.surface, borderColor: palette.border }}>
      {(title || subtitle) && (
        <div className="px-5 py-3.5 border-b" style={{ borderColor: palette.borderLight }}>
          {title && <p className="text-sm font-semibold" style={{ color: palette.text }}>{title}</p>}
          {subtitle && <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function AdminIntegrationsClient({ settings }: Props) {
  const [podProvider, setPodProvider] = useState(settings?.pod_provider || 'none')
  const [podKey, setPodKey] = useState('')
  const [podShopId, setPodShopId] = useState(settings?.pod_shop_id || '')
  const [saving, setSaving] = useState(false)

  const savePod = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/store/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pod_provider: podProvider, pod_api_key: podKey, pod_shop_id: podShopId }),
      })
      if (res.ok) toast.success('Integration saved!')
      else toast.error('Failed to save')
    } catch { toast.error('Error') }
    finally { setSaving(false) }
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Integrations" subtitle="Connect fulfillment and payment providers" />

      {/* POD */}
      <DarkCard title="Print-on-Demand Fulfillment" subtitle="Connect a POD provider to auto-fulfill orders">
        <div className="flex flex-col gap-3 mb-5">
          {POD_OPTIONS.map(p => (
            <button key={p.value} onClick={() => setPodProvider(p.value)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
              style={{
                background: podProvider === p.value ? palette.accentDim : 'transparent',
                borderColor: podProvider === p.value ? palette.accent : palette.border,
              }}>
              <span className="text-xl shrink-0">{p.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: palette.text }}>{p.label}</p>
                <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{p.desc}</p>
              </div>
              {podProvider === p.value && <CheckCircle size={16} style={{ color: palette.accent, flexShrink: 0 }} />}
            </button>
          ))}
        </div>

        {podProvider !== 'none' && (
          <div className="flex flex-col gap-3 pt-4 border-t mb-4" style={{ borderColor: palette.borderLight }}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium" style={{ color: palette.text }}>
                Configure {podProvider === 'printful' ? 'Printful' : 'Printify'}
              </p>
              {POD_OPTIONS.find(p => p.value === podProvider)?.docsUrl && (
                <a href={POD_OPTIONS.find(p => p.value === podProvider)?.docsUrl}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs"
                  style={{ color: palette.accent }}>
                  Docs <ExternalLink size={10} />
                </a>
              )}
            </div>
            <AdminField label="API Key" hint="Leave blank to keep current key">
              <AdminInput value={podKey} onChange={setPodKey} type="password" placeholder="Paste your API key" />
            </AdminField>
            {podProvider === 'printify' && (
              <AdminField label="Printify Shop ID">
                <AdminInput value={podShopId} onChange={setPodShopId} placeholder="Your shop ID" />
              </AdminField>
            )}
          </div>
        )}

        <AdminButton variant="primary" size="sm" onClick={savePod} loading={saving}>
          Save Integration
        </AdminButton>
      </DarkCard>

      {/* Stripe status */}
      <DarkCard title="Stripe Payments">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full"
              style={{ background: settings?.stripe_publishable_key ? palette.success : palette.textDim }} />
            <span className="text-sm" style={{ color: palette.text }}>
              {settings?.stripe_publishable_key ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <a href="/admin/settings" className="text-xs font-semibold" style={{ color: palette.accent }}>
            Configure in Settings →
          </a>
        </div>
      </DarkCard>
    </AdminPage>
  )
}
