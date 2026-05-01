import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let settings = null

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('store_settings')
        .select('store_name,logo_url,onboarding_complete')
        .single()
      settings = data
    } else {
      // No user — render children only (login/onboarding pages handle their own UI)
      return <>{children}</>
    }
  } catch {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar settings={settings} />
      <main className="admin-content flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
