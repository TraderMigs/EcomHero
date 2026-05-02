import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccountLayoutClient from '@/components/store/AccountLayoutClient'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/?auth=login')

  const service = createServiceClient()
  const { data: customer } = await service
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  const { data: settings } = await service
    .from('store_settings')
    .select('store_name,logo_url,primary_color,secondary_color,accent_color')
    .single()

  return (
    <AccountLayoutClient customer={customer} settings={settings}>
      {children}
    </AccountLayoutClient>
  )
}
