'use client'
import { useState, useEffect } from 'react'
import { StoreSettings, Page, Product } from '@/types'
import AdminNav from './AdminNav'
import StorePreview from './StorePreview'
import { PanelRightClose, PanelRightOpen, Monitor, Tablet, Smartphone } from 'lucide-react'

interface Props {
  settings: StoreSettings | null
  pages: Page[]
  products: Product[]
  children: React.ReactNode
}

export default function AdminStudio({ settings, pages, products, children }: Props) {
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [liveSettings, setLiveSettings] = useState(settings)
  const [livePages, setLivePages] = useState(pages)
  const [liveProducts, setLiveProducts] = useState(products)

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.settings) setLiveSettings(e.detail.settings)
      if (e.detail?.pages) setLivePages(e.detail.pages)
      if (e.detail?.products) setLiveProducts(e.detail.products)
    }
    window.addEventListener('ecomhero:preview-update', handler as EventListener)
    return () => window.removeEventListener('ecomhero:preview-update', handler as EventListener)
  }, [])

  const devices = [
    { d: 'desktop' as const, Icon: Monitor, label: 'Desktop' },
    { d: 'tablet' as const, Icon: Tablet, label: 'Tablet' },
    { d: 'mobile' as const, Icon: Smartphone, label: 'Mobile' },
  ]

  return (
    <div className="admin-studio flex h-screen overflow-hidden" style={{ background: '#0f0f11' }}>

      {/* Slim icon nav */}
      <AdminNav settings={liveSettings} />

      {/* Admin panel */}
      <div className={`flex flex-col overflow-hidden transition-all duration-300 ${previewOpen ? 'w-[400px] min-w-[360px]' : 'flex-1'}`}
        style={{ background: '#0f0f11', borderRight: '1px solid #2a2a30' }}>

        {/* Panel top bar */}
        <div className="h-10 flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: '1px solid #2a2a30', background: '#18181b' }}>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#52525b' }}>Admin</span>
          <button onClick={() => setPreviewOpen(p => !p)}
            className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded"
            style={{ color: '#71717a' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f4f4f5')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}>
            {previewOpen
              ? <><PanelRightClose size={13} /> Hide preview</>
              : <><PanelRightOpen size={13} /> Show preview</>
            }
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>

      {/* Live preview */}
      {previewOpen && (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#0a0a0b' }}>

          {/* Preview toolbar */}
          <div className="h-10 flex items-center justify-between px-4 shrink-0"
            style={{ borderBottom: '1px solid #2a2a30', background: '#18181b' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#52525b' }}>
              Live Preview
            </span>

            {/* Device toggles */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: '#0f0f11' }}>
              {devices.map(({ d, Icon, label }) => (
                <button key={d} onClick={() => setPreviewDevice(d)} title={label}
                  className="flex items-center justify-center w-7 h-7 rounded transition-all"
                  style={{
                    background: previewDevice === d ? '#2a2a30' : 'transparent',
                    color: previewDevice === d ? '#f4f4f5' : '#52525b',
                  }}>
                  <Icon size={13} />
                </button>
              ))}
            </div>

            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: '#52525b' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f4f4f5')}
              onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}>
              Open live ↗
            </a>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto flex justify-center p-5" style={{ background: '#0a0a0b' }}>
            <div
              className="bg-white overflow-hidden rounded-xl shadow-2xl h-full transition-all duration-300"
              style={{
                width: previewDevice === 'desktop' ? '100%' :
                       previewDevice === 'tablet' ? '768px' : '390px',
                maxWidth: '100%',
              }}>
              <StorePreview
                settings={liveSettings}
                pages={livePages}
                products={liveProducts}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
