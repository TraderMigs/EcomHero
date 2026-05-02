import { createClient } from '@/lib/supabase/server'
import AdminStudio from '@/components/studio/AdminStudio'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return <>{children}</>
    }

    const [{ data: settings }, { data: pages }, { data: products }] = await Promise.all([
      supabase.from('store_settings').select('*').single(),
      supabase.from('pages').select('*').order('sort_order'),
      supabase.from('products').select('id,name,slug,price,images,is_active,is_featured,sort_order').eq('is_active', true).order('sort_order').limit(12),
    ])

    return (
      <AdminStudio
        settings={settings}
        pages={pages || []}
        products={products || []}
      >
        {children}
      </AdminStudio>
    )
  } catch {
    return <>{children}</>
  }
}
