'use client'
import { useState, useCallback } from 'react'
import { Product, ProductVariant, ProductImage } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Upload, Plus, Trash2, X, GripVertical, Save, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import {
  AdminPage, AdminPageHeader, AdminCard, AdminField, AdminInput,
  AdminTextarea, AdminSelect, AdminToggle, AdminButton, AdminBackLink,
  AdminDivider, palette
} from '@/components/ui/AdminUI'

type ProductFormData = {
  name: string; slug: string; description: string; short_description: string
  price: string; compare_at_price: string; cost_per_item: string; sku: string
  track_inventory: boolean; inventory_quantity: string; is_active: boolean
  is_featured: boolean; category: string; tags: string; requires_shipping: boolean
  taxable: boolean; page_id: string; seo_title: string; seo_description: string
}

type StringKeys = { [K in keyof ProductFormData]: ProductFormData[K] extends string ? K : never }[keyof ProductFormData]
type BoolKeys = { [K in keyof ProductFormData]: ProductFormData[K] extends boolean ? K : never }[keyof ProductFormData]

interface Props {
  product: (Product & { product_variants?: ProductVariant[] }) | null
  pages: { id: string; title: string; slug: string }[]
}

export default function AdminProductForm({ product, pages }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<ProductFormData>({
    name: product?.name || '', slug: product?.slug || '',
    description: product?.description || '', short_description: product?.short_description || '',
    price: product?.price?.toString() || '', compare_at_price: product?.compare_at_price?.toString() || '',
    cost_per_item: product?.cost_per_item?.toString() || '', sku: product?.sku || '',
    track_inventory: product?.track_inventory || false, inventory_quantity: product?.inventory_quantity?.toString() || '0',
    is_active: product?.is_active ?? true, is_featured: product?.is_featured || false,
    category: product?.category || '', tags: product?.tags?.join(', ') || '',
    requires_shipping: product?.requires_shipping ?? true, taxable: product?.taxable ?? true,
    page_id: product?.page_id || '', seo_title: product?.seo_title || '', seo_description: product?.seo_description || '',
  })
  const [images, setImages] = useState<ProductImage[]>(product?.images || [])
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(product?.product_variants || [])

  const set = (k: keyof ProductFormData, v: string | boolean) => setData(d => ({ ...d, [k]: v }))
  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      try {
        const fd = new FormData(); fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const { url } = await res.json()
        if (url) setImages(prev => [...prev, { id: crypto.randomUUID(), url, alt: file.name, sort_order: prev.length }])
      } catch { toast.error(`Failed: ${file.name}`) }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true })

  const save = async () => {
    if (!data.name || !data.price) return toast.error('Name and price required')
    setSaving(true)
    try {
      const payload = {
        ...data, slug: data.slug || autoSlug(data.name),
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        cost_per_item: data.cost_per_item ? parseFloat(data.cost_per_item) : null,
        inventory_quantity: parseInt(data.inventory_quantity) || 0,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images, variants, page_id: data.page_id || null,
      }
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const res = await fetch(url, { method: product ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.product) {
        toast.success(product ? 'Updated!' : 'Created!')
        if (!product) router.push(`/admin/products/${result.product.id}`)
      } else throw new Error(result.error)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  const del = async () => {
    if (!product || !confirm('Delete this product?')) return
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    toast.success('Deleted')
    router.push('/admin/products')
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={product ? product.name : 'New Product'}
        action={
          <div className="flex gap-2">
            {product && (
              <AdminButton variant="danger" size="sm" onClick={del} icon={<Trash2 size={12} />}>Delete</AdminButton>
            )}
            <AdminButton variant="primary" size="sm" onClick={save} loading={saving} icon={<Save size={12} />}>
              {product ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        }
      />
      <AdminBackLink href="/admin/products" label="Products" />

      <div className="flex flex-col gap-4">

        {/* Basic Info */}
        <AdminCard title="Product Info">
          <div className="flex flex-col gap-4">
            <AdminField label="Product Name" required>
              <AdminInput value={data.name} onChange={v => { set('name', v); if (!product) set('slug', autoSlug(v)) }}
                placeholder="e.g. Premium Hoodie" />
            </AdminField>
            <AdminField label="URL Slug">
              <AdminInput value={data.slug} onChange={v => set('slug', v)} />
            </AdminField>
            <AdminField label="Short Description">
              <AdminInput value={data.short_description} onChange={v => set('short_description', v)}
                placeholder="Shown on product card" />
            </AdminField>
            <AdminField label="Full Description">
              <AdminTextarea value={data.description} onChange={v => set('description', v)}
                placeholder="Detailed product description..." rows={4} />
            </AdminField>
          </div>
        </AdminCard>

        {/* Images */}
        <AdminCard title="Images">
          <div className="flex flex-col gap-3">
            <div {...getRootProps()}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
              style={{
                borderColor: isDragActive ? palette.accent : palette.border,
                background: isDragActive ? palette.accentDim : 'transparent'
              }}>
              <input {...getInputProps()} />
              <Upload size={20} className="mx-auto mb-2" style={{ color: palette.textDim }} />
              <p className="text-xs" style={{ color: palette.textMuted }}>
                {uploading ? 'Uploading...' : isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs mt-1" style={{ color: palette.textDim }}>PNG, JPG, WebP</p>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden"
                    style={{ background: palette.border }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded font-semibold"
                        style={{ background: palette.accent, color: '#fff', fontSize: '9px' }}>Main</span>
                    )}
                    <button onClick={() => setImages(p => p.filter(x => x.id !== img.id))}
                      className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: palette.danger }}>
                      <X size={9} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminCard>

        {/* Pricing */}
        <AdminCard title="Pricing">
          <div className="flex flex-col gap-3">
            <AdminField label="Price" required>
              <AdminInput value={data.price} onChange={v => set('price', v)} type="number" placeholder="0.00" />
            </AdminField>
            <AdminField label="Compare at Price">
              <AdminInput value={data.compare_at_price} onChange={v => set('compare_at_price', v)} type="number" placeholder="0.00" />
            </AdminField>
            <AdminField label="Cost per Item">
              <AdminInput value={data.cost_per_item} onChange={v => set('cost_per_item', v)} type="number" placeholder="0.00" />
            </AdminField>
          </div>
        </AdminCard>

        {/* Inventory */}
        <AdminCard title="Inventory">
          <div className="flex flex-col gap-3">
            <AdminField label="SKU">
              <AdminInput value={data.sku} onChange={v => set('sku', v)} />
            </AdminField>
            <AdminToggle label="Track inventory" checked={data.track_inventory} onChange={v => set('track_inventory', v)} />
            {data.track_inventory && (
              <AdminField label="Quantity">
                <AdminInput value={data.inventory_quantity} onChange={v => set('inventory_quantity', v)} type="number" />
              </AdminField>
            )}
          </div>
        </AdminCard>

        {/* Variants */}
        <AdminCard title="Variants">
          {variants.length === 0 ? (
            <p className="text-xs py-2" style={{ color: palette.textMuted }}>No variants — single price product.</p>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {variants.map(v => (
                <div key={v.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: palette.bg }}>
                  <GripVertical size={12} style={{ color: palette.textDim }} />
                  <input value={v.name || ''} onChange={e => setVariants(p => p.map(x => x.id === v.id ? { ...x, name: e.target.value } : x))}
                    placeholder="e.g. Small / Red"
                    className="flex-1 px-2.5 py-1.5 rounded text-xs border outline-none"
                    style={{ background: palette.surface, borderColor: palette.border, color: palette.text }} />
                  <input type="number" value={v.price || ''} onChange={e => setVariants(p => p.map(x => x.id === v.id ? { ...x, price: parseFloat(e.target.value) } : x))}
                    placeholder="Price" className="w-20 px-2.5 py-1.5 rounded text-xs border outline-none"
                    style={{ background: palette.surface, borderColor: palette.border, color: palette.text }} />
                  <button onClick={() => setVariants(p => p.filter(x => x.id !== v.id))}
                    style={{ color: palette.danger }}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setVariants(p => [...p, { id: crypto.randomUUID(), name: '', is_active: true, sort_order: p.length, inventory_quantity: 0 }])}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color: palette.accent }}>
            <Plus size={12} /> Add Variant
          </button>
        </AdminCard>

        {/* Status & Organization */}
        <AdminCard title="Status">
          <div className="flex flex-col gap-3">
            <AdminToggle label="Active" description="Visible to customers" checked={data.is_active} onChange={v => set('is_active', v)} />
            <AdminToggle label="Featured" checked={data.is_featured} onChange={v => set('is_featured', v)} />
            <AdminToggle label="Requires Shipping" checked={data.requires_shipping} onChange={v => set('requires_shipping', v)} />
            <AdminToggle label="Taxable" checked={data.taxable} onChange={v => set('taxable', v)} />
            <AdminDivider />
            <AdminField label="Assign to Page">
              <AdminSelect value={data.page_id} onChange={v => set('page_id', v)}
                options={[{ value: '', label: 'No specific page' }, ...pages.map(p => ({ value: p.id, label: p.title }))]} />
            </AdminField>
            <AdminField label="Category">
              <AdminInput value={data.category} onChange={v => set('category', v)} placeholder="e.g. Apparel" />
            </AdminField>
            <AdminField label="Tags (comma separated)">
              <AdminInput value={data.tags} onChange={v => set('tags', v)} placeholder="hoodie, unisex, premium" />
            </AdminField>
          </div>
        </AdminCard>

        {/* SEO */}
        <AdminCard title="SEO">
          <div className="flex flex-col gap-3">
            <AdminField label="SEO Title">
              <AdminInput value={data.seo_title} onChange={v => set('seo_title', v)} placeholder="Defaults to product name" />
            </AdminField>
            <AdminField label="SEO Description">
              <AdminTextarea value={data.seo_description} onChange={v => set('seo_description', v)} rows={3} />
            </AdminField>
          </div>
        </AdminCard>

        {/* Save */}
        <AdminButton variant="primary" size="lg" onClick={save} loading={saving} icon={<Save size={14} />}>
          {product ? 'Update Product' : 'Create Product'}
        </AdminButton>

      </div>
    </AdminPage>
  )
}
