'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Settings, Image, Tag, Zap, BarChart2, LogOut, ExternalLink, Star, Mail
} from 'lucide-react'
import { StoreSettings } from '@/types'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { href: '/admin/integrations', label: 'Integrations', icon: Zap },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface Props {
  settings: StoreSettings | null
}

export default function AdminNav({ settings }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-14 flex flex-col items-center py-3 shrink-0"
      style={{ background: '#0f0f11', borderRight: '1px solid #2a2a30' }}>

      {/* Store initial */}
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 shrink-0"
        style={{ background: '#6366f120' }}>
        <span className="text-xs font-bold" style={{ color: '#6366f1' }}>
          {settings?.store_name?.charAt(0)?.toUpperCase() || 'E'}
        </span>
      </div>

      {/* Nav links — Next.js Link for instant SPA navigation */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href}
              title={item.label}
              prefetch={true}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative"
              style={{
                background: active ? '#6366f1' : 'transparent',
                color: active ? '#fff' : '#52525b',
              }}>
              <item.icon size={16} />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#18181b', color: '#f4f4f5', border: '1px solid #2a2a30' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          title="View Store"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative"
          style={{ color: '#52525b' }}>
          <ExternalLink size={15} />
          <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#18181b', color: '#f4f4f5', border: '1px solid #2a2a30' }}>
            View Store
          </span>
        </a>
        <button onClick={logout} title="Sign Out"
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative"
          style={{ color: '#52525b' }}>
          <LogOut size={15} />
          <span className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: '#18181b', color: '#f4f4f5', border: '1px solid #2a2a30' }}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
