'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, ShoppingBag, MapPin, LogOut, ChevronRight, Package } from 'lucide-react'

interface Props {
  customer: { first_name?: string; last_name?: string; email: string } | null
  settings: { store_name?: string; logo_url?: string; primary_color?: string; secondary_color?: string; accent_color?: string } | null
  children: React.ReactNode
}

const NAV = [
  { href: '/account', label: 'My Orders', icon: ShoppingBag, exact: true },
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/addresses', label: 'Saved Addresses', icon: MapPin },
]

export default function AccountLayoutClient({ customer, settings, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const displayName = customer?.first_name
    ? `${customer.first_name}${customer.last_name ? ' ' + customer.last_name : ''}`
    : customer?.email?.split('@')[0] || 'Account'

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-secondary)' }}>
      {/* Header */}
      <header className="border-b px-4 h-14 flex items-center justify-between max-w-5xl mx-auto"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
        <a href="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="" className="h-7 object-contain max-w-[120px]" />
          ) : (
            <span className="font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>
              {settings?.store_name || 'Store'}
            </span>
          )}
        </a>
        <a href="/" className="text-xs opacity-50 hover:opacity-80 transition-opacity flex items-center gap-1">
          <Package size={13} /> Back to store
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                style={{ background: 'var(--brand-primary)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs opacity-40 truncate">{customer?.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1">
              {NAV.map(item => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                    style={{
                      background: active ? 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' : 'transparent',
                      color: active ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 60%, transparent)',
                    }}>
                    <item.icon size={15} />
                    {item.label}
                    {active && <ChevronRight size={13} className="ml-auto" />}
                  </Link>
                )
              })}
              <button onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2"
                style={{ color: 'color-mix(in srgb, var(--brand-primary) 40%, transparent)' }}>
                <LogOut size={15} />
                Sign out
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
