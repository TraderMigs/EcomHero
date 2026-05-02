import { createServiceClient } from '@/lib/supabase/server'
import AdminNewsletterClient from '@/components/admin/AdminNewsletterClient'

export default async function AdminNewsletterPage() {
  const supabase = createServiceClient()

  const [{ count }, { data: recent }] = await Promise.all([
    supabase.from('email_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('email_subscribers').select('email, source, subscribed_at').eq('is_active', true).order('subscribed_at', { ascending: false }).limit(20),
  ])

  return <AdminNewsletterClient count={count || 0} recent={recent || []} />
}
