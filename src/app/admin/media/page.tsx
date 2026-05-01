import { createServiceClient } from '@/lib/supabase/server'
import AdminMediaClient from '@/components/admin/AdminMediaClient'

export default async function MediaPage() {
  const supabase = createServiceClient()
  const { data: files } = await supabase.from('media_library').select('*').order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Media Library</h1>
        <p className="text-sm text-gray-500 mt-1">{files?.length || 0} files</p>
      </div>
      <AdminMediaClient files={files || []} />
    </div>
  )
}
