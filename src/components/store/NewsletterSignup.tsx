'use client'
import { useState } from 'react'
import { Loader2, CheckCircle, Mail } from 'lucide-react'

interface Props {
  accentColor?: string
}

export default function NewsletterSignup({ accentColor }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!email || !email.includes('@')) { setError('Please enter a valid email'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })
      if (res.ok) setDone(true)
      else setError('Something went wrong. Please try again.')
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 py-4">
        <CheckCircle size={20} style={{ color: accentColor || 'var(--brand-accent)' }} />
        <div>
          <p className="font-semibold text-sm">You&apos;re subscribed!</p>
          <p className="text-xs opacity-60">Check your inbox for a welcome email.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Mail size={16} style={{ opacity: 0.6 }} />
        <p className="text-sm font-semibold">Get exclusive deals in your inbox</p>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="Your email address"
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border bg-transparent outline-none transition-colors"
          style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        <button
          onClick={submit}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
          style={{ background: accentColor || 'var(--brand-accent)' }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Subscribe
        </button>
      </div>
      {error && <p className="text-xs mt-2 opacity-60" style={{ color: 'var(--brand-accent)' }}>{error}</p>}
      <p className="text-xs opacity-30 mt-2">No spam. Unsubscribe anytime.</p>
    </div>
  )
}
