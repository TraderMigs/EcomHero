import { createServiceClient } from '@/lib/supabase/server'
import { Plus, FileText, Eye, EyeOff, Pencil } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminBadge, AdminEmpty, palette
} from '@/components/ui/AdminUI'

export default async function PagesAdminPage() {
  const supabase = createServiceClient()
  const { data: pages } = await supabase.from('pages').select('*').order('sort_order')

  return (
    <AdminPage>
      <AdminPageHeader
        title="Pages"
        subtitle={`${pages?.length || 0} pages · Click Edit to open the visual builder`}
        action={
          <a href="/admin/pages/new"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90"
            style={{ background: palette.accent }}>
            <Plus size={13} /> New Page
          </a>
        }
      />
      {pages && pages.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {pages.map(page => (
            <div key={page.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all group"
              style={{ background: palette.surface, borderColor: palette.border }}>
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center`}
                  style={{ background: page.is_active ? '#22c55e15' : palette.border }}>
                  <FileText size={12} style={{ color: page.is_active ? '#22c55e' : palette.textDim }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: palette.text }}>{page.title}</p>
                  <p className="text-xs" style={{ color: palette.textDim }}>/{page.slug} · {page.page_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs" style={{ color: palette.textDim }}>
                  {page.show_in_nav ? <Eye size={11} /> : <EyeOff size={11} />}
                  <span>{page.show_in_nav ? 'Nav' : 'Hidden'}</span>
                </div>
                <AdminBadge variant={page.is_active ? 'success' : 'default'}>
                  {page.is_active ? 'Active' : 'Draft'}
                </AdminBadge>
                <a href={`/admin/pages/${page.id}`}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ background: palette.accentDim, color: palette.accent }}>
                  <Pencil size={10} /> Edit
                </a>
                <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs transition-colors"
                  style={{ color: palette.textDim }}>
                  View ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty icon={<FileText size={18} />} title="No pages yet" subtitle="Create your first page" />
        </div>
      )}
    </AdminPage>
  )
}
