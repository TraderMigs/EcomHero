import { createServiceClient } from '@/lib/supabase/server'
import { Plus, Package } from 'lucide-react'

export default async function ProductsPage() {
  const supabase = createServiceClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(count)')
    .order('sort_order')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Products</h1>
          <p className="text-sm text-gray-500 mt-1">{products?.length || 0} total products</p>
        </div>
        <a href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: '#000' }}>
          <Plus size={16} /> Add Product
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {products && products.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">${product.price?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.track_inventory ? product.inventory_quantity : '∞'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/admin/products/${product.id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline">
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium mb-2">No products yet</p>
            <a href="/admin/products/new" className="text-sm text-blue-600 hover:underline">Add your first product →</a>
          </div>
        )}
      </div>
    </div>
  )
}
