import { createServiceClient } from '@/lib/supabase/server'
import { Plus, Package } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminTable, AdminTableRow,
  AdminTableCell, AdminBadge, AdminEmpty, palette
} from '@/components/ui/AdminUI'

export default async function ProductsPage() {
  const supabase = createServiceClient()
  const { data: products } = await supabase
    .from('products').select('*, product_variants(count)').order('sort_order')

  return (
    <AdminPage>
      <AdminPageHeader
        title="Products"
        subtitle={`${products?.length || 0} products`}
        action={
          <a href="/admin/products/new"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: palette.accent }}>
            <Plus size={13} /> Add Product
          </a>
        }
      />

      {products && products.length > 0 ? (
        <AdminTable headers={['Product', 'Price', 'Status', 'Inventory', '']}>
          {products.map(p => (
            <AdminTableRow key={p.id}>
              <AdminTableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: palette.border }}>
                    {p.images?.[0]?.url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={14} style={{ color: palette.textDim }} /></div>
                    }
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: palette.text }}>{p.name}</p>
                    {p.sku && <p className="text-xs" style={{ color: palette.textDim }}>SKU: {p.sku}</p>}
                  </div>
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs font-bold">${p.price?.toFixed(2)}</span>
              </AdminTableCell>
              <AdminTableCell>
                <AdminBadge variant={p.is_active ? 'success' : 'default'}>
                  {p.is_active ? 'Active' : 'Draft'}
                </AdminBadge>
              </AdminTableCell>
              <AdminTableCell>
                <span className="text-xs" style={{ color: palette.textMuted }}>
                  {p.track_inventory ? p.inventory_quantity : '∞'}
                </span>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <a href={`/admin/products/${p.id}`}
                  className="text-xs font-semibold transition-colors"
                  style={{ color: palette.accent }}>
                  Edit
                </a>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      ) : (
        <div className="rounded-xl border" style={{ borderColor: palette.border, background: palette.surface }}>
          <AdminEmpty
            icon={<Package size={18} />}
            title="No products yet"
            subtitle="Add your first product to get started"
            action={
              <a href="/admin/products/new"
                className="text-xs font-semibold transition-colors"
                style={{ color: palette.accent }}>
                Add Product →
              </a>
            }
          />
        </div>
      )}
    </AdminPage>
  )
}
