import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Allow onboarding without auth
  // For admin routes beyond onboarding, check auth
  if (!user) {
    redirect('/admin/login')
  }

  const { data: settings } = await supabase
    .from('store_settings')
    .select('store_name,logo_url,onboarding_complete')
    .single()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar settings={settings} />
      <main className="admin-content flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
