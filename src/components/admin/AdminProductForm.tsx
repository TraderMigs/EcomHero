'use client'
import { useState, useCallback } from 'react'
import { Product, ProductVariant, ProductImage } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, Plus, X, Upload, GripVertical } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface Props {
  product: (Product & { product_variants?: ProductVariant[] }) | null
  pages: { id: string; title: string; slug: string }[]
}

export default function AdminProductForm({ product, pages }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [data, setData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    cost_per_item: product?.cost_per_item?.toString() || '',
    sku: product?.sku || '',
    track_inventory: product?.track_inventory || false,
    inventory_quantity: product?.inventory_quantity?.toString() || '0',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured || false,
    category: product?.category || '',
    tags: product?.tags?.join(', ') || '',
    requires_shipping: product?.requires_shipping ?? true,
    taxable: product?.taxable ?? true,
    page_id: product?.page_id || '',
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
  })

  const [images, setImages] = useState<ProductImage[]>(product?.images || [])
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(product?.product_variants || [])

  const set = (k: string, v: string | boolean) => setData(d => ({ ...d, [k]: v }))

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const { url } = await res.json()
        if (url) {
          setImages(prev => [...prev, { id: crypto.randomUUID(), url, alt: file.name, sort_order: prev.length }])
        }
      } catch { toast.error(`Failed to upload ${file.name}`) }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true
  })

  const removeImage = (id: string) => setImages(prev => prev.filter(i => i.id !== id))

  const addVariant = () => setVariants(prev => [...prev, { id: crypto.randomUUID(), name: '', price: undefined, sku: '', inventory_quantity: 0, is_active: true, sort_order: prev.length }])
  const updateVariant = (id: string, k: string, v: string | boolean | number) =>
    setVariants(prev => prev.map(v2 => v2.id === id ? { ...v2, [k]: v } : v2))
  const removeVariant = (id: string) => setVariants(prev => prev.filter(v2 => v2.id !== id))

  const save = async () => {
    if (!data.name || !data.price) return toast.error('Name and price are required')
    setSaving(true)
    try {
      const payload = {
        ...data,
        slug: data.slug || autoSlug(data.name),
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        cost_per_item: data.cost_per_item ? parseFloat(data.cost_per_item) : null,
        inventory_quantity: parseInt(data.inventory_quantity) || 0,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images,
        variants,
        page_id: data.page_id || null,
      }
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.product) {
        toast.success(product ? 'Product updated!' : 'Product created!')
        if (!product) router.push(`/admin/products/${result.product.id}`)
      } else throw new Error(result.error)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  const deleteProduct = async () => {
    if (!product || !confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
    toast.success('Product deleted')
    router.push('/admin/products')
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-4">{children}</div>
    </div>
  )

  const Field = ({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) => (
    <div className={half ? '' : ''}>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">{label}</label>
      {children}
    </div>
  )

  const Input = ({ k, type = 'text', placeholder = '' }: { k: string; type?: string; placeholder?: string }) => (
    <input type={type} value={(data as Record<string, string>)[k] || ''} onChange={e => set(k, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Left col */}
      <div className="xl:col-span-2 flex flex-col gap-5">
        <Section title="Product Info">
          <Field label="Product Name *">
            <input value={data.name} onChange={e => { set('name', e.target.value); if (!product) set('slug', autoSlug(e.target.value)) }}
              placeholder="e.g. Premium Hoodie"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </Field>
          <Field label="URL Slug">
            <input value={data.slug} onChange={e => set('slug', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none font-mono" />
          </Field>
          <Field label="Short Description">
            <Input k="short_description" placeholder="Brief summary shown in product card" />
          </Field>
          <Field label="Full Description">
            <textarea value={data.description} onChange={e => set('description', e.target.value)}
              rows={5} placeholder="Detailed product description..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none resize-y" />
          </Field>
        </Section>

        {/* Images */}
        <Section title="Images">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" /> Uploading...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={24} />
                <p className="text-sm">{isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}</p>
                <p className="text-xs">PNG, JPG, WebP up to 10MB</p>
              </div>
            )}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={img.id} className="relative group aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover rounded-lg" />
                  {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">Main</span>}
                  <button onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Variants */}
        <Section title="Variants (Size, Color, etc.)">
          {variants.length === 0 ? (
            <p className="text-sm text-gray-400">No variants. Single price product.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {variants.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                  <GripVertical size={14} className="text-gray-300 cursor-grab" />
                  <input value={v.name || ''} onChange={e => updateVariant(v.id!, 'name', e.target.value)}
                    placeholder="e.g. Small / Red"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none" />
                  <input type="number" value={v.price || ''} onChange={e => updateVariant(v.id!, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                    className="w-24 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none" />
                  <input value={v.sku || ''} onChange={e => updateVariant(v.id!, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="w-24 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none" />
                  <button onClick={() => removeVariant(v.id!)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={addVariant}
            className="self-start flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
            <Plus size={14} /> Add Variant
          </button>
        </Section>

        {/* SEO */}
        <Section title="SEO">
          <Field label="SEO Title"><Input k="seo_title" placeholder="Defaults to product name" /></Field>
          <Field label="SEO Description">
            <textarea value={data.seo_description} onChange={e => set('seo_description', e.target.value)}
              rows={3} placeholder="Brief description for search engines"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
          </Field>
        </Section>
      </div>

      {/* Right col */}
      <div className="flex flex-col gap-5">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Status</h2>
          <div className="flex flex-col gap-3">
            {[
              { k: 'is_active', label: 'Active (visible in store)' },
              { k: 'is_featured', label: 'Featured product' },
              { k: 'requires_shipping', label: 'Requires shipping' },
              { k: 'taxable', label: 'Charge tax' },
            ].map(item => (
              <label key={item.k} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!(data as Record<string, boolean>)[item.k]}
                  onChange={e => set(item.k, e.target.checked)}
                  className="w-4 h-4 rounded" />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Assign to Page</label>
            <select value={data.page_id} onChange={e => set('page_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
              <option value="">No specific page</option>
              {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Pricing</h2>
          <Field label="Price *"><Input k="price" type="number" placeholder="0.00" /></Field>
          <Field label="Compare at (original)"><Input k="compare_at_price" type="number" placeholder="0.00" /></Field>
          <Field label="Cost per item"><Input k="cost_per_item" type="number" placeholder="0.00" /></Field>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Inventory</h2>
          <Field label="SKU"><Input k="sku" /></Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.track_inventory} onChange={e => set('track_inventory', e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm">Track inventory</span>
          </label>
          {data.track_inventory && (
            <Field label="Quantity"><Input k="inventory_quantity" type="number" /></Field>
          )}
        </div>

        {/* Organization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Organization</h2>
          <Field label="Category"><Input k="category" placeholder="e.g. Apparel, Accessories" /></Field>
          <Field label="Tags (comma separated)"><Input k="tags" placeholder="hoodie, unisex, premium" /></Field>
        </div>

        {/* Save / Delete */}
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: '#000' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>

        {product && (
          <button onClick={deleteProduct} disabled={deleting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50">
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Product
          </button>
        )}
      </div>
    </div>
  )
}
