import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StoreFront from '@/components/store/StoreFront'

export default async function HomePage() {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .single()

  // If onboarding not done, redirect to admin setup
  if (!settings || !settings.onboarding_complete) {
    redirect('/admin/onboarding')
  }

  const { data: homePage } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'home')
    .eq('is_active', true)
    .single()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true)
    .order('sort_order')

  const { data: navMenus } = await supabase
    .from('nav_menus')
    .select('*')

  return (
    <StoreFront
      settings={settings}
      page={homePage}
      products={products || []}
      navMenus={navMenus || []}
    />
  )
}
