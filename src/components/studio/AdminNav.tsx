'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Settings, Image, Tag, Zap, BarChart2, LogOut, ExternalLink
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
    <aside className="w-14 bg-gray-900 flex flex-col items-center py-3 shrink-0 border-r border-gray-800">
      {/* Store logo/initial */}
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4 shrink-0">
        <span className="text-white text-xs font-bold">
          {settings?.store_name?.charAt(0) || 'E'}
        </span>
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <a key={item.href} href={item.href}
              title={item.label}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all group relative ${
                active ? 'bg-white text-gray-900' : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}>
              <item.icon size={16} />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                {item.label}
              </span>
            </a>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1">
        <a href="/" target="_blank" rel="noopener noreferrer"
          title="View Store"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all group relative">
          <ExternalLink size={15} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
            View Store
          </span>
        </a>
        <button onClick={logout} title="Sign Out"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all group relative">
          <LogOut size={15} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  )
}
