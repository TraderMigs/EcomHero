import { createServiceClient } from '@/lib/supabase/server'
import AdminPageForm from '@/components/admin/AdminPageForm'
import { notFound } from 'next/navigation'

export default async function EditPageAdminPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const { data: page } = await supabase.from('pages').select('*').eq('id', params.id).single()
  if (!page) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <a href="/admin/pages" className="text-sm text-gray-400 hover:text-gray-600">← Pages</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{page.title}</h1>
      </div>
      <AdminPageForm page={page} />
    </div>
  )
}
