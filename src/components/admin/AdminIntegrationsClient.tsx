'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react'

interface Props {
  settings: { pod_provider?: string; pod_shop_id?: string; stripe_publishable_key?: string } | null
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

  const POD = [
    { value: 'none', label: 'None', desc: 'I manage my own inventory', icon: '📦', color: '#6b7280' },
    { value: 'printful', label: 'Printful', desc: 'Print-on-demand & fulfillment', icon: '🖨️', color: '#0062ff', docsUrl: 'https://www.printful.com/api' },
    { value: 'printify', label: 'Printify', desc: '100+ print providers globally', icon: '🎨', color: '#00c5a2', docsUrl: 'https://developers.printify.com' },
  ]

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* POD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-sm">Print-on-Demand Fulfillment</h2>
          <p className="text-xs text-gray-400 mt-0.5">Connect a POD provider to auto-fulfill orders</p>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {POD.map(p => (
              <button key={p.value} onClick={() => setPodProvider(p.value)}
                className={`relative p-4 border-2 rounded-xl text-left transition-all ${podProvider === p.value ? 'border-black' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="font-semibold text-sm">{p.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                {podProvider === p.value && (
                  <CheckCircle size={16} className="absolute top-3 right-3 text-green-500" />
                )}
              </button>
            ))}
          </div>

          {podProvider !== 'none' && (
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-100 animate-fade-in">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Configure {podProvider === 'printful' ? 'Printful' : 'Printify'}</p>
                {POD.find(p => p.value === podProvider)?.docsUrl && (
                  <a href={POD.find(p => p.value === podProvider)?.docsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Docs <ExternalLink size={10} />
                  </a>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">API Key</label>
                <input type="password" value={podKey} onChange={e => setPodKey(e.target.value)}
                  placeholder="Paste your API key (leave blank to keep current)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none font-mono" />
              </div>
              {podProvider === 'printify' && (
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Shop ID</label>
                  <input value={podShopId} onChange={e => setPodShopId(e.target.value)}
                    placeholder="Your Printify shop ID"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
              )}
            </div>
          )}

          <button onClick={savePod} disabled={saving}
            className="self-start flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
            style={{ background: '#000' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} Save Integration
          </button>
        </div>
      </div>

      {/* Stripe status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-sm">Stripe Payments</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${settings?.stripe_publishable_key ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">{settings?.stripe_publishable_key ? 'Connected' : 'Not connected'}</span>
          </div>
          <a href="/admin/settings" className="text-xs text-blue-600 hover:underline">Configure in Settings →</a>
        </div>
      </div>
    </div>
  )
}
