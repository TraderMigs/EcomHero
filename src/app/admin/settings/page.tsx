import { createServiceClient } from '@/lib/supabase/server'
import AdminSettingsForm from '@/components/admin/AdminSettingsForm'

export default async function SettingsPage() {
  const supabase = createServiceClient()
  const { data: settings } = await supabase.from('store_settings').select('*').single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store configuration</p>
      </div>
      <AdminSettingsForm settings={settings} />
    </div>
  )
}
