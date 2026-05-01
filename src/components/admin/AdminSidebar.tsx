'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Settings, Image, Tag, Zap, BarChart2, LogOut, ExternalLink, ChevronRight
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/integrations', label: 'Integrations', icon: Zap },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface Props {
  settings: { store_name: string; logo_url?: string | null } | null
}

export default function AdminSidebar({ settings }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="admin-sidebar flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
          {settings?.store_name || 'EcomHero'}
        </h1>
        <p className="text-white/30 text-xs mt-0.5">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}>
              <item.icon size={16} className={active ? 'text-black' : 'text-white/40 group-hover:text-white'} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto opacity-40" />}
            </a>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 flex flex-col gap-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all">
          <ExternalLink size={16} className="text-white/40" />
          View Store
        </a>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all w-full">
          <LogOut size={16} className="text-white/40" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
