'use client'
import { useState } from 'react'
import { Page } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Save, Trash2 } from 'lucide-react'
import {
  AdminPage, AdminPageHeader, AdminCard, AdminField, AdminInput,
  AdminTextarea, AdminSelect, AdminToggle, AdminButton, AdminBackLink,
  AdminDivider, palette
} from '@/components/ui/AdminUI'

interface Props { page: Page | null }

type PageFormData = {
  title: string; slug: string; page_type: string; is_active: boolean
  show_in_nav: boolean; nav_label: string; hero_heading: string
  hero_subheading: string; hero_cta_text: string; hero_cta_link: string
  hero_image_url: string; meta_title: string; meta_description: string
}

async function broadcastPagesUpdate() {
  try {
    const res = await fetch('/api/pages')
    const { pages } = await res.json()
    window.dispatchEvent(new CustomEvent('ecomhero:preview-update', { detail: { pages } }))
  } catch {}
}

export default function AdminPageForm({ page }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<PageFormData>({
    title: page?.title || '', slug: page?.slug || '',
    page_type: page?.page_type || 'custom',
    is_active: page?.is_active ?? true,
    show_in_nav: page?.show_in_nav ?? true,
    nav_label: page?.nav_label || '',
    hero_heading: page?.hero_heading || '',
    hero_subheading: page?.hero_subheading || '',
    hero_cta_text: page?.hero_cta_text || '',
    hero_cta_link: page?.hero_cta_link || '',
    hero_image_url: page?.hero_image_url || '',
    meta_title: page?.meta_title || '',
    meta_description: page?.meta_description || '',
  })

  const set = (k: keyof PageFormData, v: string | boolean) => setData(d => ({ ...d, [k]: v }))
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const save = async () => {
    if (!data.title) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = { ...data, slug: data.slug || autoSlug(data.title) }
      const url = page ? `/api/pages/${page.id}` : '/api/pages'
      const res = await fetch(url, { method: page ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.page) {
        toast.success(page ? 'Page updated!' : 'Page created!')
        broadcastPagesUpdate()
        if (!page) router.push(`/admin/pages/${result.page.id}`)
      } else throw new Error(result.error)
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
    finally { setSaving(false) }
  }

  const del = async () => {
    if (!page || !confirm('Delete this page?')) return
    await fetch(`/api/pages/${page.id}`, { method: 'DELETE' })
    toast.success('Page deleted')
    broadcastPagesUpdate()
    router.push('/admin/pages')
  }

  const PAGE_TYPES = ['home','product','catalog','about','contact','custom','faq','policy']
    .map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))

  return (
    <AdminPage>
      <AdminPageHeader
        title={page ? page.title : 'New Page'}
        action={
          <div className="flex gap-2">
            {page && page.page_type !== 'home' && (
              <AdminButton variant="danger" size="sm" onClick={del} icon={<Trash2 size={12} />}>Delete</AdminButton>
            )}
            <AdminButton variant="primary" size="sm" onClick={save} loading={saving} icon={<Save size={12} />}>
              {page ? 'Update' : 'Create'}
            </AdminButton>
          </div>
        }
      />
      <AdminBackLink href="/admin/pages" label="Pages" />

      <div className="flex flex-col gap-4">

        <AdminCard title="Page Info">
          <div className="flex flex-col gap-4">
            <AdminField label="Title" required>
              <AdminInput value={data.title}
                onChange={v => { set('title', v); if (!page) set('slug', autoSlug(v)) }} />
            </AdminField>
            <AdminField label="URL Slug">
              <AdminInput value={data.slug} onChange={v => set('slug', v)} />
            </AdminField>
            <AdminField label="Page Type">
              <AdminSelect value={data.page_type} onChange={v => set('page_type', v)} options={PAGE_TYPES} />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="Navigation">
          <div className="flex flex-col gap-3">
            <AdminToggle label="Page is active" checked={data.is_active} onChange={v => set('is_active', v)} />
            <AdminToggle label="Show in navigation" checked={data.show_in_nav} onChange={v => set('show_in_nav', v)} />
            {data.show_in_nav && (
              <AdminField label="Nav Label" hint="Defaults to page title">
                <AdminInput value={data.nav_label} onChange={v => set('nav_label', v)} placeholder="e.g. Shop" />
              </AdminField>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Hero Section">
          <div className="flex flex-col gap-3">
            <AdminField label="Heading">
              <AdminInput value={data.hero_heading} onChange={v => set('hero_heading', v)} placeholder="Welcome to our store" />
            </AdminField>
            <AdminField label="Subheading">
              <AdminInput value={data.hero_subheading} onChange={v => set('hero_subheading', v)} placeholder="Discover our latest products" />
            </AdminField>
            <div className="grid grid-cols-2 gap-3">
              <AdminField label="CTA Text">
                <AdminInput value={data.hero_cta_text} onChange={v => set('hero_cta_text', v)} placeholder="Shop Now" />
              </AdminField>
              <AdminField label="CTA Link">
                <AdminInput value={data.hero_cta_link} onChange={v => set('hero_cta_link', v)} placeholder="#products" />
              </AdminField>
            </div>
            <AdminField label="Hero Image URL">
              <AdminInput value={data.hero_image_url} onChange={v => set('hero_image_url', v)} placeholder="https://..." />
            </AdminField>
          </div>
        </AdminCard>

        <AdminCard title="SEO">
          <div className="flex flex-col gap-3">
            <AdminField label="Meta Title">
              <AdminInput value={data.meta_title} onChange={v => set('meta_title', v)} />
            </AdminField>
            <AdminField label="Meta Description">
              <AdminTextarea value={data.meta_description} onChange={v => set('meta_description', v)} rows={3} />
            </AdminField>
          </div>
        </AdminCard>

        <AdminButton variant="primary" size="lg" onClick={save} loading={saving} icon={<Save size={14} />}>
          {page ? 'Update Page' : 'Create Page'}
        </AdminButton>

      </div>
    </AdminPage>
  )
}
