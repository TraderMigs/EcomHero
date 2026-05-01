'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Lock } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handle = async () => {
    if (!email || !password) return
    setLoading(true)
    const supabase = createClient()
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/admin')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created! Check your email to confirm.')
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Admin Access</h1>
          <p className="text-white/40 text-sm mt-1">EcomHero Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === m ? 'bg-white shadow' : 'opacity-50'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none"
              style={{ borderColor: '#e5e7eb' }}
              onKeyDown={e => e.key === 'Enter' && handle()} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none"
              style={{ borderColor: '#e5e7eb' }}
              onKeyDown={e => e.key === 'Enter' && handle()} />
            <button onClick={handle} disabled={loading || !email || !password}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white disabled:opacity-40 transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: '#000' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
