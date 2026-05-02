'use client'
import { useState, useEffect, useCallback } from 'react'
import { StoreSettings, Page, Product } from '@/types'
import AdminNav from './AdminNav'
import StorePreview from './StorePreview'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

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

  // Listen for preview update events dispatched by any admin form
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.settings) setLiveSettings(e.detail.settings)
      if (e.detail?.pages) setLivePages(e.detail.pages)
    }
    window.addEventListener('ecomhero:preview-update', handler as EventListener)
    return () => window.removeEventListener('ecomhero:preview-update', handler as EventListener)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* ── Fixed left nav (narrow icon+label sidebar) ─────────────────── */}
      <AdminNav settings={liveSettings} />

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className={`flex flex-1 overflow-hidden transition-all duration-300`}>

        {/* Admin panel — scrollable */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${previewOpen ? 'w-[420px] min-w-[380px]' : 'flex-1'}`}>
          {/* Panel header */}
          <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Admin</span>
            <button
              onClick={() => setPreviewOpen(p => !p)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              title={previewOpen ? 'Hide preview' : 'Show preview'}>
              {previewOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
              {previewOpen ? 'Hide preview' : 'Show preview'}
            </button>
          </div>
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5">
            {children}
          </div>
        </div>

        {/* ── Live preview pane ──────────────────────────────────────── */}
        {previewOpen && (
          <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-200 bg-gray-200">
            {/* Preview toolbar */}
            <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Live Preview</span>
              {/* Device toggles */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                {([
                  { d: 'desktop', label: '🖥' },
                  { d: 'tablet', label: '📱' },
                  { d: 'mobile', label: '📲' },
                ] as const).map(({ d, label }) => (
                  <button key={d} onClick={() => setPreviewDevice(d)}
                    className={`px-2.5 py-1 rounded text-xs transition-all ${previewDevice === d ? 'bg-white shadow font-semibold' : 'text-gray-400 hover:text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                Open live ↗
              </a>
            </div>

            {/* Preview canvas */}
            <div className="flex-1 overflow-auto flex justify-center p-4">
              <div
                className="bg-white shadow-xl overflow-hidden rounded-lg transition-all duration-300 h-full"
                style={{
                  width: previewDevice === 'desktop' ? '100%' :
                         previewDevice === 'tablet' ? '768px' : '390px',
                  maxWidth: '100%',
                }}>
                <StorePreview
                  settings={liveSettings}
                  pages={livePages}
                  products={products}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
