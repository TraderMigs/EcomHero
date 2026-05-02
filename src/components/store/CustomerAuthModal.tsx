'use client'
import { useState } from 'react'
import { X, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: () => void
  defaultMode?: 'login' | 'signup'
}

export default function CustomerAuthModal({ onClose, onSuccess, defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '',
  })

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setError('')
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email }),
        })
        setResetSent(true)
        setLoading(false)
        return
      }

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      onSuccess()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 text-sm border rounded-xl outline-none transition-colors focus:border-current bg-transparent"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
            {mode === 'login' && 'Sign in'}
            {mode === 'signup' && 'Create account'}
            {mode === 'reset' && 'Reset password'}
          </h2>
          <p className="text-sm opacity-50 mt-1">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Join us today'}
            {mode === 'reset' && "We'll send you a reset link"}
          </p>
        </div>

        {/* Reset sent state */}
        {resetSent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle size={48} style={{ color: 'var(--brand-accent)' }} />
            <p className="font-semibold">Check your email</p>
            <p className="text-sm opacity-60">We sent a password reset link to <strong>{form.email}</strong></p>
            <button onClick={() => { setMode('login'); setResetSent(false) }}
              className="text-sm underline opacity-60 hover:opacity-80 mt-2">
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Name fields (signup only) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                  placeholder="First name"
                  className={inputCls}
                  style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                />
                <input
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                  placeholder="Last name"
                  className={inputCls}
                  style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                />
              </div>
            )}

            {/* Email */}
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="Email address"
              className={inputCls}
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />

            {/* Password */}
            {mode !== 'reset' && (
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder={mode === 'signup' ? 'Password (min 8 characters)' : 'Password'}
                  className={`${inputCls} pr-12`}
                  style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}

            {/* Forgot password link */}
            {mode === 'login' && (
              <button
                onClick={() => setMode('reset')}
                className="text-xs text-right opacity-50 hover:opacity-80 -mt-1">
                Forgot password?
              </button>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs font-medium px-3 py-2 rounded-lg"
                style={{ background: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', color: 'var(--brand-accent)' }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-3.5 font-semibold text-sm rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
              style={{ background: 'var(--brand-primary)' }}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'reset' && 'Send reset link'}
            </button>

            {/* Toggle */}
            <p className="text-center text-sm opacity-50">
              {mode === 'login' ? (
                <>No account?{' '}
                  <button onClick={() => setMode('signup')}
                    className="font-semibold underline hover:opacity-80" style={{ color: 'var(--brand-primary)' }}>
                    Sign up
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('login')}
                    className="font-semibold underline hover:opacity-80" style={{ color: 'var(--brand-primary)' }}>
                    Sign in
                  </button>
                </>
              ) : (
                <button onClick={() => setMode('login')}
                  className="underline hover:opacity-80">
                  Back to sign in
                </button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
