'use client'
import { StoreSettings, Page, Product, ContentBlock } from '@/types'
import { useState } from 'react'
import { ShoppingBag, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  settings: StoreSettings | null
  pages: Page[]
  products: Product[]
}

export default function StorePreview({ settings, pages, products }: Props) {
  const [activePage, setActivePage] = useState<string>('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const primary = settings?.primary_color || '#000000'
  const secondary = settings?.secondary_color || '#ffffff'
  const accent = settings?.accent_color || '#ff4500'
  const storeName = settings?.store_name || 'My Store'
  const tagline = settings?.tagline || ''

  const navPages = pages.filter(p => p.show_in_nav && p.is_active)
  const currentPage = pages.find(p => p.slug === activePage) || pages.find(p => p.page_type === 'home') || null
  const blocks: ContentBlock[] = currentPage?.content || []

  const colors = { primary, secondary, accent }

  return (
    <div className="min-h-full text-sm overflow-auto" style={{ background: secondary, color: primary, fontFamily: 'system-ui, sans-serif' }}>

      {/* Announcement bar */}
      {settings?.announcement_bar_active && settings.announcement_bar && (
        <div className="text-center py-1.5 px-4 text-xs font-medium" style={{ background: primary, color: secondary }}>
          {settings.announcement_bar}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 border-b px-4 h-12 flex items-center justify-between"
        style={{ background: secondary, borderColor: `${primary}15` }}>
        <button onClick={() => setActivePage('home')}
          className="font-bold text-base" style={{ color: primary }}>
          {storeName}
        </button>
        <nav className="hidden md:flex items-center gap-5">
          {navPages.map(p => (
            <button key={p.id} onClick={() => setActivePage(p.slug)}
              className="text-xs font-medium transition-opacity hover:opacity-60"
              style={{ color: primary, opacity: activePage === p.slug ? 1 : 0.65 }}>
              {p.nav_label || p.title}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="relative p-1.5">
            <ShoppingBag size={16} style={{ color: primary }} />
          </button>
          <button className="md:hidden p-1.5" onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="border-b px-4 py-3 flex flex-col gap-3 md:hidden" style={{ borderColor: `${primary}15`, background: secondary }}>
          {navPages.map(p => (
            <button key={p.id} onClick={() => { setActivePage(p.slug); setMenuOpen(false) }}
              className="text-left text-xs font-medium" style={{ color: primary }}>
              {p.nav_label || p.title}
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <main>
        {blocks.length > 0 ? (
          blocks.map(block => (
            <PreviewBlock key={block.id} block={block} products={products} colors={colors} />
          ))
        ) : (
          <EmptyPagePreview
            page={currentPage}
            settings={settings}
            products={products}
            colors={colors}
          />
        )}
      </main>

      {/* Footer */}
      <div className="border-t mt-8 px-6 py-8" style={{ borderColor: `${primary}10` }}>
        <p className="font-bold text-sm">{storeName}</p>
        {tagline && <p className="text-xs opacity-50 mt-1">{tagline}</p>}
        <p className="text-xs opacity-30 mt-4">
          {settings?.footer_text || `© ${new Date().getFullYear()} ${storeName}`}
        </p>
      </div>
    </div>
  )
}

// ── Empty page — shows ghost skeleton with store data ─────────────────────────

function EmptyPagePreview({ page, settings, products, colors }: {
  page: Page | null
  settings: StoreSettings | null
  products: Product[]
  colors: { primary: string; secondary: string; accent: string }
}) {
  const isHome = !page || page.page_type === 'home'

  if (isHome) {
    return (
      <>
        {/* Ghost hero */}
        <div className="relative flex items-center justify-center py-24 px-8 text-center"
          style={{ background: `linear-gradient(135deg, ${colors.primary}ee, ${colors.primary}99)` }}>
          <div>
            <h1 className="text-4xl font-bold mb-3" style={{ color: colors.secondary }}>
              {settings?.store_name || 'Your Store Name'}
            </h1>
            <p className="text-base opacity-70 mb-6" style={{ color: colors.secondary }}>
              {settings?.tagline || 'Your tagline goes here'}
            </p>
            <span className="inline-block px-6 py-2.5 text-xs font-bold tracking-wider uppercase text-white rounded"
              style={{ background: colors.accent }}>
              Shop Now
            </span>
          </div>
          <div className="absolute bottom-3 right-4 text-xs opacity-30 text-white">
            Edit in Pages → Home to customize
          </div>
        </div>

        {/* Ghost products */}
        {products.length > 0 && (
          <div className="px-6 py-10">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: colors.primary }}>
              Our Products
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {products.slice(0, 6).map(p => (
                <div key={p.id} className="rounded-xl overflow-hidden border" style={{ borderColor: `${colors.primary}10` }}>
                  <div className="aspect-square bg-gray-100">
                    {p.images?.[0]?.url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">📦</div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-xs truncate">{p.name}</p>
                    <p className="font-bold text-xs mt-1">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="px-6 py-10 text-center opacity-30">
            <p className="text-sm">Add products to see them here</p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center opacity-40">
      <p className="text-2xl mb-2">📄</p>
      <p className="font-semibold text-sm">{page?.title}</p>
      <p className="text-xs mt-1">No content yet — click Edit to build this page</p>
    </div>
  )
}

// ── Block preview renderer ────────────────────────────────────────────────────

function PreviewBlock({ block, products, colors }: {
  block: ContentBlock
  products: Product[]
  colors: { primary: string; secondary: string; accent: string }
}) {
  const data = block.data as unknown as Record<string, unknown>

  switch (block.type) {
    case 'hero': return <PreviewHero data={data} colors={colors} />
    case 'slideshow': return <PreviewSlideshow data={data} colors={colors} />
    case 'product_grid': return <PreviewProductGrid data={data} products={products} colors={colors} />
    case 'text': return <PreviewText data={data} colors={colors} />
    case 'image_text': return <PreviewImageText data={data} colors={colors} />
    case 'testimonials': return <PreviewTestimonials data={data} colors={colors} />
    case 'faq': return <PreviewFaq data={data} colors={colors} />
    case 'cta_banner': return <PreviewCtaBanner data={data} />
    case 'video': return <PreviewVideo data={data} />
    case 'divider': return <PreviewDivider data={data} colors={colors} />
    case 'spacer': return <div style={{ height: `${(data.height as number) || 40}px` }} />
    default: return null
  }
}

// ── Safe cast helpers ─────────────────────────────────────────────────────────
const s = (v: unknown): string => (v as string) || ''
const n = (v: unknown, def = 0): number => (v as number) ?? def

// ── Individual block renderers ────────────────────────────────────────────────

const heights: Record<string, string> = { small: '35vh', medium: '55vh', large: '75vh', full: '95vh' }

function PreviewHero({ data, colors }: { data: Record<string, unknown>; colors: { primary: string; secondary: string; accent: string } }) {
  return (
    <div className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: heights[s(data.height)] || '55vh' }}>
      {data.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s(data.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${n(data.overlay_opacity, 40) / 100})` }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colors.primary}ee, ${colors.primary}88)` }} />
      )}
      <div className="relative z-10 px-8 py-12 max-w-2xl w-full" style={{ textAlign: (s(data.text_align) || 'center') as 'left' | 'center' | 'right' }}>
        {s(data.heading) && <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: data.image_url ? '#fff' : colors.secondary }}>{s(data.heading)}</h1>}
        {s(data.subheading) && <p className="text-base mb-6 opacity-80" style={{ color: data.image_url ? '#fff' : colors.secondary }}>{s(data.subheading)}</p>}
        {s(data.cta_text) && (
          <span className="inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded" style={{ background: colors.accent }}>
            {s(data.cta_text)}
          </span>
        )}
      </div>
    </div>
  )
}

function PreviewSlideshow({ data, colors }: { data: Record<string, unknown>; colors: { primary: string; secondary: string; accent: string } }) {
  const [idx, setIdx] = useState(0)
  const slides = (data.slides as Record<string, unknown>[]) || []
  if (!slides.length) return null
  const slide = slides[idx]
  return (
    <div className="relative overflow-hidden" style={{ minHeight: heights[s(data.height)] || '55vh' }}>
      {slide.image_url
        // eslint-disable-next-line @next/next/no-img-element
        ? <><img src={s(slide.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40" /></>
        : <div className="absolute inset-0" style={{ background: `${colors.primary}cc` }} />
      }
      <div className="relative z-10 flex items-center justify-center h-full px-8 py-16 text-center">
        <div>
          {s(slide.heading) && <h2 className="text-3xl font-bold text-white mb-3">{s(slide.heading)}</h2>}
          {s(slide.subheading) && <p className="text-base text-white/80 mb-5">{s(slide.subheading)}</p>}
          {s(slide.cta_text) && <span className="inline-block px-5 py-2 text-xs font-bold text-white rounded" style={{ background: colors.accent }}>{s(slide.cta_text)}</span>}
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 rounded-full text-white z-20"><ChevronLeft size={16} /></button>
          <button onClick={() => setIdx(i => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/20 rounded-full text-white z-20"><ChevronRight size={16} /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all ${i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />)}
          </div>
        </>
      )}
    </div>
  )
}

function PreviewProductGrid({ data, products, colors }: { data: Record<string, unknown>; products: Product[]; colors: { primary: string; secondary: string; accent: string } }) {
  const cols = n(data.columns, 3)
  const display = (data.show_all as boolean)
    ? products.slice(0, n(data.limit, 8))
    : products.filter(p => (data.product_ids as string[])?.includes(p.id))
  const colClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'
  return (
    <div className="px-5 py-10">
      {s(data.heading) && <h2 className="text-2xl font-bold text-center mb-2" style={{ color: colors.primary }}>{s(data.heading)}</h2>}
      {s(data.subheading) && <p className="text-center text-sm opacity-60 mb-6">{s(data.subheading)}</p>}
      <div className={`grid ${colClass} gap-3`}>
        {display.map(p => (
          <div key={p.id} className="rounded-xl overflow-hidden border" style={{ borderColor: `${colors.primary}10` }}>
            <div className="aspect-square bg-gray-100">
              {p.images?.[0]?.url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-200">📦</div>}
            </div>
            <div className="p-2.5">
              <p className="font-semibold text-xs truncate">{p.name}</p>
              <p className="font-bold text-xs mt-0.5">${p.price}</p>
            </div>
          </div>
        ))}
        {display.length === 0 && <div className="col-span-3 py-8 text-center text-gray-300 text-xs border-2 border-dashed border-gray-100 rounded-xl">No products</div>}
      </div>
    </div>
  )
}

function PreviewText({ data, colors }: { data: Record<string, unknown>; colors: { primary: string } }) {
  const maxWidths: Record<string, string> = { narrow: '480px', medium: '640px', wide: '860px', full: '100%' }
  return (
    <div className="px-5 py-8">
      <p className="mx-auto leading-relaxed text-sm opacity-75"
        style={{ color: colors.primary, textAlign: (s(data.align) || 'center') as 'left' | 'center' | 'right', maxWidth: maxWidths[s(data.max_width)] || '640px' }}>
        {s(data.content)}
      </p>
    </div>
  )
}

function PreviewImageText({ data, colors }: { data: Record<string, unknown>; colors: { primary: string; secondary: string; accent: string } }) {
  const isLeft = data.layout !== 'image_right'
  const radii: Record<string, string> = { square: '0', rounded: '12px', circle: '50%' }
  return (
    <div className="px-5 py-10">
      <div className={`flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
        <div className="w-full md:w-2/5 aspect-square bg-gray-100 overflow-hidden shrink-0" style={{ borderRadius: radii[s(data.image_shape)] || '12px' }}>
          {data.image_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={s(data.image_url)} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-200 text-3xl">🖼️</div>}
        </div>
        <div className="flex-1">
          {s(data.heading) && <h2 className="text-2xl font-bold mb-3" style={{ color: colors.primary }}>{s(data.heading)}</h2>}
          {s(data.body) && <p className="text-sm opacity-70 leading-relaxed mb-4">{s(data.body)}</p>}
          {s(data.cta_text) && <span className="inline-block px-5 py-2 text-xs font-bold text-white rounded" style={{ background: colors.primary }}>{s(data.cta_text)}</span>}
        </div>
      </div>
    </div>
  )
}

function PreviewTestimonials({ data, colors }: { data: Record<string, unknown>; colors: { primary: string } }) {
  const items = (data.items as Record<string, unknown>[]) || []
  return (
    <div className="px-5 py-10 bg-gray-50">
      {s(data.heading) && <h2 className="text-2xl font-bold text-center mb-8" style={{ color: colors.primary }}>{s(data.heading)}</h2>}
      <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, j) => <span key={j} className={`text-xs ${j < n(item.rating, 5) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}</div>
            <p className="text-xs opacity-70 leading-relaxed mb-3">&ldquo;{s(item.quote)}&rdquo;</p>
            <p className="text-xs font-semibold">{s(item.author)}</p>
            <p className="text-xs opacity-40">{s(item.role)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewFaq({ data, colors }: { data: Record<string, unknown>; colors: { primary: string } }) {
  const [open, setOpen] = useState<number | null>(null)
  const items = (data.items as Record<string, unknown>[]) || []
  return (
    <div className="px-5 py-10 max-w-2xl mx-auto">
      {s(data.heading) && <h2 className="text-2xl font-bold text-center mb-6" style={{ color: colors.primary }}>{s(data.heading)}</h2>}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50">
              <span className="text-xs font-semibold">{s(item.question)}</span>
              <span className="text-gray-400 ml-3 shrink-0">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <div className="px-4 pb-3 text-xs opacity-60 leading-relaxed">{s(item.answer)}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewCtaBanner({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="px-5 py-14 text-center" style={{ background: s(data.background_color) || '#000', color: s(data.text_color) || '#fff' }}>
      {s(data.heading) && <h2 className="text-2xl font-bold mb-2">{s(data.heading)}</h2>}
      {s(data.subheading) && <p className="text-sm opacity-80 mb-5">{s(data.subheading)}</p>}
      {s(data.cta_text) && <span className="inline-block px-6 py-2.5 text-xs font-bold border-2 border-current rounded">{s(data.cta_text)}</span>}
    </div>
  )
}

function PreviewVideo({ data }: { data: Record<string, unknown> }) {
  const getEmbed = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    const vm = url.match(/vimeo\.com\/(\d+)/)
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`
    return url
  }
  if (!data.url) return <div className="px-5 py-10 text-center text-gray-300 text-xs">Add a video URL in the editor</div>
  return (
    <div className="px-5 py-8 max-w-2xl mx-auto">
      <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe src={getEmbed(s(data.url))} className="w-full h-full" allowFullScreen title="video" />
      </div>
      {s(data.caption) && <p className="text-center text-xs opacity-50 mt-2">{s(data.caption)}</p>}
    </div>
  )
}

function PreviewDivider({ data, colors }: { data: Record<string, unknown>; colors: { primary: string } }) {
  const sp: Record<string, string> = { small: '12px', medium: '32px', large: '56px' }
  const py = sp[s(data.spacing)] || '32px'
  return (
    <div style={{ padding: `${py} 24px` }}>
      {data.style === 'line' && <div className="h-px opacity-10" style={{ background: colors.primary }} />}
      {data.style === 'dots' && <div className="flex justify-center gap-2">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full opacity-20" style={{ background: colors.primary }} />)}</div>}
    </div>
  )
}
