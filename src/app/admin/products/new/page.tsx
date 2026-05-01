import { createServiceClient } from '@/lib/supabase/server'
import AdminProductForm from '@/components/admin/AdminProductForm'

export default async function NewProductPage() {
  const supabase = createServiceClient()
  const { data: pages } = await supabase.from('pages').select('id,title,slug').order('sort_order')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <a href="/admin/products" className="text-sm text-gray-400 hover:text-gray-600">← Products</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>New Product</h1>
      </div>
      <AdminProductForm product={null} pages={pages || []} />
    </div>
  )
}
