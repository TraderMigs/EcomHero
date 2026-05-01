'use client'
import { useState } from 'react'
import { Page } from '@/types'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2 } from 'lucide-react'

interface Props { page: Page | null }

type PageFormData = {
  title: string
  slug: string
  page_type: string
  is_active: boolean
  show_in_nav: boolean
  nav_label: string
  hero_heading: string
  hero_subheading: string
  hero_cta_text: string
  hero_cta_link: string
  hero_image_url: string
  meta_title: string
  meta_description: string
}

export default function AdminPageForm({ page }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<PageFormData>({
    title: page?.title || '',
    slug: page?.slug || '',
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
      const method = page ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.page) {
        toast.success(page ? 'Page updated!' : 'Page created!')
        if (!page) router.push(`/admin/pages/${result.page.id}`)
      } else throw new Error(result.error)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally { setSaving(false) }
  }

  const del = async () => {
    if (!page || !confirm('Delete this page?')) return
    await fetch(`/api/pages/${page.id}`, { method: 'DELETE' })
    toast.success('Page deleted')
    router.push('/admin/pages')
  }

  const Input = ({ k, placeholder = '' }: { k: keyof PageFormData; placeholder?: string }) => (
    <input
      value={(data[k] as string) || ''}
      onChange={e => set(k, e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
    />
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-6 flex flex-col gap-4">{children}</div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 max-w-5xl">
      <div className="xl:col-span-2 flex flex-col gap-5">
        <Section title="Page Info">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Title *</label>
            <input value={data.title} onChange={e => { set('title', e.target.value); if (!page) set('slug', autoSlug(e.target.value)) }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">URL Slug</label>
            <Input k="slug" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Page Type</label>
            <select value={data.page_type} onChange={e => set('page_type', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
              {['home','product','catalog','about','contact','custom','faq','policy'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Hero Section">
          <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Heading</label><Input k="hero_heading" placeholder="Welcome to our store" /></div>
          <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Subheading</label><Input k="hero_subheading" placeholder="Discover our latest products" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">CTA Text</label><Input k="hero_cta_text" placeholder="Shop Now" /></div>
            <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">CTA Link</label><Input k="hero_cta_link" placeholder="#products" /></div>
          </div>
          <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Hero Image URL</label><Input k="hero_image_url" placeholder="https://..." /></div>
        </Section>

        <Section title="SEO">
          <div><label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Meta Title</label><Input k="meta_title" /></div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Meta Description</label>
            <textarea value={data.meta_description} onChange={e => set('meta_description', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none" />
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Settings</h2>
          {([
            { k: 'is_active' as keyof PageFormData, label: 'Page is active' },
            { k: 'show_in_nav' as keyof PageFormData, label: 'Show in navigation' },
          ]).map(item => (
            <label key={item.k} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={data[item.k] as boolean}
                onChange={e => set(item.k, e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm">{item.label}</span>
            </label>
          ))}
          {data.show_in_nav && (
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1.5">Nav Label</label>
              <Input k="nav_label" placeholder="Defaults to title" />
            </div>
          )}
        </div>

        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: '#000' }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
        </button>

        {page && page.page_type !== 'home' && (
          <button onClick={del}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-red-600 border border-red-200 hover:bg-red-50">
            <Trash2 size={16} /> Delete Page
          </button>
        )}
      </div>
    </div>
  )
}
