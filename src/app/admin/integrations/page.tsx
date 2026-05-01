import { createServiceClient } from '@/lib/supabase/server'
import AdminIntegrationsClient from '@/components/admin/AdminIntegrationsClient'

export default async function IntegrationsPage() {
  const supabase = createServiceClient()
  const { data: settings } = await supabase
    .from('store_settings')
    .select('pod_provider,pod_shop_id,stripe_publishable_key')
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Connect fulfillment and payment providers</p>
      </div>
      <AdminIntegrationsClient settings={settings} />
    </div>
  )
}
