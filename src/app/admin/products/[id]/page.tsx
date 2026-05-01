import { createServiceClient } from '@/lib/supabase/server'
import AdminProductForm from '@/components/admin/AdminProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createServiceClient()
  const [{ data: product }, { data: pages }] = await Promise.all([
    supabase.from('products').select('*, product_variants(*)').eq('id', params.id).single(),
    supabase.from('pages').select('id,title,slug').order('sort_order'),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <a href="/admin/products" className="text-sm text-gray-400 hover:text-gray-600">← Products</a>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h1>
      </div>
      <AdminProductForm product={product} pages={pages || []} />
    </div>
  )
}
