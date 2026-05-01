'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Check, ChevronRight, Store, Palette, Package, CreditCard, Zap, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Store Info', icon: Store },
  { id: 2, label: 'Store Type', icon: Package },
  { id: 3, label: 'Branding', icon: Palette },
  { id: 4, label: 'Fulfillment', icon: Zap },
  { id: 5, label: 'Payments', icon: CreditCard },
]

const STORE_TYPES = [
  { value: 'single', label: 'One Product', desc: 'Perfect for a single viral or hero product', icon: '🎯' },
  { value: 'catalog', label: 'Small Catalog', desc: 'A few products, 2–4 pages', icon: '🛍️' },
  { value: 'full', label: 'Full Store', desc: 'Multiple categories, unlimited pages', icon: '🏪' },
]

const POD_PROVIDERS = [
  { value: 'none', label: 'None — I manage my own products', icon: '📦' },
  { value: 'printful', label: 'Printful', icon: '🖨️' },
  { value: 'printify', label: 'Printify', icon: '🎨' },
]

const ACCENT_PRESETS = ['#ff4500','#e11d48','#7c3aed','#2563eb','#059669','#d97706','#000000','#64748b']

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    store_name: '',
    tagline: '',
    store_type: 'single' as 'single' | 'catalog' | 'full',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#ff4500',
    pod_provider: 'none' as 'none' | 'printful' | 'printify',
    pod_api_key: '',
    pod_shop_id: '',
    stripe_publishable_key: '',
    stripe_secret_key: '',
    contact_email: '',
  })

  const set = (key: string, val: string) => setData(d => ({ ...d, [key]: val }))

  const next = () => setStep(s => Math.min(5, s + 1))
  const back = () => setStep(s => Math.max(1, s - 1))

  const canNext = () => {
    if (step === 1) return data.store_name.trim().length > 0
    return true
  }

  const finish = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/store/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Store created! Welcome to EcomHero 🎉')
        router.push('/admin')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome to EcomHero
          </h1>
          <p className="text-white/50 text-sm">Let's set up your store in 2 minutes</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.id ? 'bg-green-500 text-white' :
                step === s.id ? 'bg-white text-black' :
                'bg-white/10 text-white/40'
              }`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 transition-all ${step > s.id ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Step 1: Store Info */}
            {step === 1 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Tell us about your store</h2>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Store Name *</label>
                  <input value={data.store_name} onChange={e => set('store_name', e.target.value)}
                    placeholder="e.g. Nova Threads, Bloom & Co..."
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-lg"
                    style={{ borderColor: '#e5e7eb', '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Tagline <span className="opacity-40">(optional)</span></label>
                  <input value={data.tagline} onChange={e => set('tagline', e.target.value)}
                    placeholder="e.g. Quality you can feel"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Contact Email <span className="opacity-40">(optional)</span></label>
                  <input type="email" value={data.contact_email} onChange={e => set('contact_email', e.target.value)}
                    placeholder="hello@yourstore.com"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
              </div>
            )}

            {/* Step 2: Store Type */}
            {step === 2 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>What kind of store?</h2>
                <p className="text-sm opacity-60">All layouts are pre-wired. You can switch anytime in settings.</p>
                <div className="flex flex-col gap-3">
                  {STORE_TYPES.map(type => (
                    <button key={type.value} onClick={() => set('store_type', type.value)}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                        data.store_type === type.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <p className="font-bold">{type.label}</p>
                        <p className={`text-sm ${data.store_type === type.value ? 'opacity-70' : 'opacity-50'}`}>{type.desc}</p>
                      </div>
                      {data.store_type === type.value && <Check size={20} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Branding */}
            {step === 3 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Brand your store</h2>
                <p className="text-sm opacity-60">You can change all of this later in the admin.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={data.primary_color} onChange={e => set('primary_color', e.target.value)}
                        className="w-12 h-12 rounded-lg border cursor-pointer" />
                      <span className="text-sm font-mono opacity-60">{data.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={data.secondary_color} onChange={e => set('secondary_color', e.target.value)}
                        className="w-12 h-12 rounded-lg border cursor-pointer" />
                      <span className="text-sm font-mono opacity-60">{data.secondary_color}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Accent Color</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map(color => (
                      <button key={color} onClick={() => set('accent_color', color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${data.accent_color === color ? 'border-black scale-125' : 'border-transparent'}`}
                        style={{ background: color }} />
                    ))}
                    <input type="color" value={data.accent_color} onChange={e => set('accent_color', e.target.value)}
                      className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 cursor-pointer" title="Custom color" />
                  </div>
                </div>
                {/* Live preview */}
                <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                  <div className="h-2" style={{ background: data.primary_color }} />
                  <div className="p-4 flex items-center justify-between" style={{ background: data.secondary_color }}>
                    <span className="font-bold text-sm" style={{ color: data.primary_color }}>{data.store_name || 'Your Store'}</span>
                    <button className="text-xs px-3 py-1.5 rounded text-white font-semibold" style={{ background: data.accent_color }}>Shop Now</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Fulfillment */}
            {step === 4 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>How do you fulfill orders?</h2>
                <div className="flex flex-col gap-3">
                  {POD_PROVIDERS.map(p => (
                    <button key={p.value} onClick={() => set('pod_provider', p.value)}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                        data.pod_provider === p.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                      <span className="text-2xl">{p.icon}</span>
                      <span className="font-medium">{p.label}</span>
                      {data.pod_provider === p.value && <Check size={20} className="ml-auto" />}
                    </button>
                  ))}
                </div>
                {data.pod_provider !== 'none' && (
                  <div className="flex flex-col gap-3 pt-2 animate-fade-in">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">{data.pod_provider === 'printify' ? 'Printify' : 'Printful'} API Key</label>
                      <input value={data.pod_api_key} onChange={e => set('pod_api_key', e.target.value)}
                        placeholder="Paste your API key"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none font-mono text-sm"
                        style={{ borderColor: '#e5e7eb' }} />
                    </div>
                    {data.pod_provider === 'printify' && (
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Printify Shop ID</label>
                        <input value={data.pod_shop_id} onChange={e => set('pod_shop_id', e.target.value)}
                          placeholder="Your shop ID from Printify dashboard"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                          style={{ borderColor: '#e5e7eb' }} />
                      </div>
                    )}
                    <p className="text-xs opacity-40">You can skip this now and add it later in Admin → Integrations</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Payments */}
            {step === 5 && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Connect Stripe</h2>
                <p className="text-sm opacity-60">Stripe handles all payments and taxes automatically. You can also skip this and add it later in Admin → Settings.</p>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Publishable Key</label>
                  <input value={data.stripe_publishable_key} onChange={e => set('stripe_publishable_key', e.target.value)}
                    placeholder="pk_live_xxx or pk_test_xxx"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none font-mono text-sm"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 block mb-2">Secret Key</label>
                  <input type="password" value={data.stripe_secret_key} onChange={e => set('stripe_secret_key', e.target.value)}
                    placeholder="sk_live_xxx or sk_test_xxx"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none font-mono text-sm"
                    style={{ borderColor: '#e5e7eb' }} />
                </div>
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer"
                  className="text-xs underline opacity-50 hover:opacity-80">
                  Get your Stripe API keys →
                </a>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-8 py-5 bg-gray-50 border-t flex justify-between items-center">
            <button onClick={back} disabled={step === 1}
              className="text-sm font-medium opacity-50 hover:opacity-100 disabled:opacity-20 transition-opacity">
              ← Back
            </button>
            <span className="text-xs opacity-30">{step} of {STEPS.length}</span>
            {step < 5 ? (
              <button onClick={next} disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white disabled:opacity-30 transition-all hover:opacity-90"
                style={{ background: '#000' }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={finish} disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: '#000' }}>
                {saving ? <><Loader2 size={16} className="animate-spin" /> Setting up...</> : <>Launch Store 🚀</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
