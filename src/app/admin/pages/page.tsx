import { createServiceClient } from '@/lib/supabase/server'
import { Plus, FileText, Eye, EyeOff } from 'lucide-react'

export default async function PagesAdminPage() {
  const supabase = createServiceClient()
  const { data: pages } = await supabase.from('pages').select('*').order('sort_order')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Pages</h1>
          <p className="text-sm text-gray-500 mt-1">{pages?.length || 0} pages</p>
        </div>
        <a href="/admin/pages/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
          style={{ background: '#000' }}>
          <Plus size={16} /> New Page
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {pages && pages.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {pages.map(page => (
              <div key={page.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${page.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FileText size={14} className={page.is_active ? 'text-green-600' : 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{page.title}</p>
                    <p className="text-xs text-gray-400">/{page.slug} · {page.page_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {page.show_in_nav ? <Eye size={12} /> : <EyeOff size={12} />}
                    {page.show_in_nav ? 'In nav' : 'Hidden'}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${page.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {page.is_active ? 'Active' : 'Draft'}
                  </span>
                  <a href={`/admin/pages/${page.id}`} className="text-xs text-blue-600 hover:underline font-semibold">Edit</a>
                  <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-gray-600">View ↗</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>No pages yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
