import AdminPageForm from '@/components/admin/AdminPageForm'

export default function NewPageAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <a href="/admin/pages" className="text-sm text-gray-400 hover:text-gray-600">← Pages</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>New Page</h1>
      </div>
      <AdminPageForm page={null} />
    </div>
  )
}
