'use client'
import { useState, useCallback, useRef } from 'react'
import { MediaFile } from '@/types'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  Upload, Trash2, Copy, X, Loader2, ZoomIn, ZoomOut,
  RotateCw, FlipHorizontal, Sun, Contrast, Droplets, Image as ImageIcon
} from 'lucide-react'
import { palette } from '@/components/ui/palette'
import { AdminPage, AdminPageHeader } from '@/components/ui/AdminUI'

interface Props { files: MediaFile[] }

function Slider({ label, value, min, max, onChange, icon }: {
  label: string; value: number; min: number; max: number
  onChange: (v: number) => void; icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs" style={{ color: palette.textMuted }}>
        <div className="flex items-center gap-1.5">{icon}<span>{label}</span></div>
        <span className="font-mono" style={{ color: palette.text }}>
          {value}{label === 'Blur' ? 'px' : '%'}
        </span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer"
        style={{ accentColor: palette.accent }} />
    </div>
  )
}

function EditorBtn({ onClick, children, active }: { onClick: () => void; children: React.ReactNode; active?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-all"
      style={{
        background: active ? palette.accent : palette.border,
        color: active ? '#fff' : palette.text,
      }}>
      {children}
    </button>
  )
}

export default function AdminMediaClient({ files: initial }: Props) {
  const [files, setFiles] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaFile | null>(null)
  const [editing, setEditing] = useState<MediaFile | null>(null)

  const [rotate, setRotate] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [scale, setScale] = useState(1)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) {
          const newFile: MediaFile = {
            id: crypto.randomUUID(), file_name: file.name, file_url: data.url,
            file_type: file.type, file_size: file.size, created_at: new Date().toISOString(),
          }
          setFiles(prev => [newFile, ...prev])
          toast.success(`${file.name} uploaded`)
        }
      } catch { toast.error(`Failed: ${file.name}`) }
    }
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [], 'video/*': [] }, multiple: true
  })

  const del = async (id: string) => {
    await fetch(`/api/media/${id}`, { method: 'DELETE' })
    setFiles(prev => prev.filter(f => f.id !== id))
    if (selected?.id === id) setSelected(null)
    toast.success('Deleted')
  }

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success('URL copied!') }

  const openEditor = (file: MediaFile) => {
    setEditing(file)
    setRotate(0); setFlipH(false); setBrightness(100)
    setContrast(100); setSaturation(100); setBlur(0); setScale(1)
  }

  const resetEditor = () => { setRotate(0); setFlipH(false); setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setScale(1) }

  const editorStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
    transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scale(${scale})`,
    transition: 'transform 0.2s ease',
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const FILTERS = [
    { name: 'None', b: 100, c: 100, s: 100, bl: 0 },
    { name: 'B&W', b: 100, c: 120, s: 0, bl: 0 },
    { name: 'Vivid', b: 110, c: 130, s: 150, bl: 0 },
    { name: 'Fade', b: 115, c: 85, s: 80, bl: 0 },
    { name: 'Cool', b: 100, c: 110, s: 90, bl: 0 },
    { name: 'Warm', b: 105, c: 110, s: 120, bl: 0 },
  ]

  return (
    <AdminPage>
      <AdminPageHeader title="Media Library" subtitle={`${files.length} files`} />

      {/* Upload zone */}
      <div {...getRootProps()}
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragActive ? palette.accent : palette.border,
          background: isDragActive ? palette.accentDim : 'transparent',
        }}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: palette.textMuted }}>
            <Loader2 size={16} className="animate-spin" /> Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={22} style={{ color: palette.textDim }} />
            <p className="text-sm" style={{ color: palette.textMuted }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs" style={{ color: palette.textDim }}>Images and videos supported</p>
          </div>
        )}
      </div>

      {/* Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map(file => (
            <div key={file.id}
              onClick={() => setSelected(selected?.id === file.id ? null : file)}
              className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
              style={{
                background: palette.border,
                borderColor: selected?.id === file.id ? palette.accent : 'transparent',
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 gap-1"
                style={{ background: 'rgba(0,0,0,0.5)' }}>
                <button onClick={e => { e.stopPropagation(); openEditor(file) }}
                  className="p-1.5 rounded text-white text-xs" style={{ background: palette.accent }} title="Edit">
                  ✏️
                </button>
                <button onClick={e => { e.stopPropagation(); copyUrl(file.file_url) }}
                  className="p-1.5 rounded text-white" style={{ background: palette.surface }} title="Copy URL">
                  <Copy size={11} />
                </button>
                <button onClick={e => { e.stopPropagation(); del(file.id) }}
                  className="p-1.5 rounded text-white" style={{ background: palette.danger }} title="Delete">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border py-12 flex flex-col items-center gap-3 text-center"
          style={{ borderColor: palette.border, background: palette.surface }}>
          <ImageIcon size={32} style={{ color: palette.textDim }} />
          <p className="text-sm" style={{ color: palette.textMuted }}>No media files yet</p>
        </div>
      )}

      {/* Selected info bar */}
      {selected && (
        <div className="rounded-xl border p-3 flex items-center gap-3" style={{ background: palette.surface, borderColor: palette.border }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.file_url} alt={selected.file_name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: palette.text }}>{selected.file_name}</p>
            <p className="text-xs" style={{ color: palette.textMuted }}>{formatBytes(selected.file_size ?? undefined)}</p>
            <p className="text-xs font-mono truncate" style={{ color: palette.textDim }}>{selected.file_url}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => openEditor(selected)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold"
              style={{ background: palette.border, color: palette.text }}>
              Edit
            </button>
            <button onClick={() => copyUrl(selected.file_url)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold"
              style={{ background: palette.border, color: palette.text }}>
              <Copy size={11} /> Copy
            </button>
            <button onClick={() => del(selected.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold"
              style={{ background: palette.dangerDim, color: palette.danger }}>
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Image Studio Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setEditing(null)}>
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: palette.borderLight }}>
              <h2 className="font-bold text-base" style={{ color: palette.text }}>Image Studio</h2>
              <button onClick={() => setEditing(null)} style={{ color: palette.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Preview */}
              <div className="flex-1 flex items-center justify-center p-6 overflow-hidden"
                style={{ background: palette.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editing.file_url} alt="" style={editorStyle}
                  className="max-w-full max-h-[380px] object-contain rounded-lg select-none" />
              </div>

              {/* Controls */}
              <div className="w-64 border-l p-4 overflow-y-auto flex flex-col gap-4"
                style={{ borderColor: palette.borderLight }}>

                {/* Transform */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: palette.textMuted }}>Transform</p>
                  <div className="flex flex-wrap gap-1.5">
                    <EditorBtn onClick={() => setRotate(r => r - 90)}><RotateCw size={11} className="scale-x-[-1]" /> L</EditorBtn>
                    <EditorBtn onClick={() => setRotate(r => r + 90)}><RotateCw size={11} /> R</EditorBtn>
                    <EditorBtn onClick={() => setFlipH(f => !f)} active={flipH}><FlipHorizontal size={11} /> Flip</EditorBtn>
                    <EditorBtn onClick={resetEditor}><X size={11} /> Reset</EditorBtn>
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: palette.textMuted }}>Zoom</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))}
                      className="p-1.5 rounded" style={{ background: palette.border, color: palette.text }}>
                      <ZoomOut size={13} />
                    </button>
                    <span className="flex-1 text-center text-xs font-mono" style={{ color: palette.text }}>{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(3, s + 0.1))}
                      className="p-1.5 rounded" style={{ background: palette.border, color: palette.text }}>
                      <ZoomIn size={13} />
                    </button>
                  </div>
                </div>

                {/* Adjustments */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: palette.textMuted }}>Adjustments</p>
                  <Slider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} icon={<Sun size={11} />} />
                  <Slider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} icon={<Contrast size={11} />} />
                  <Slider label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} icon={<Droplets size={11} />} />
                  <Slider label="Blur" value={blur} min={0} max={10} onChange={setBlur} icon={<ImageIcon size={11} />} />
                </div>

                {/* Presets */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: palette.textMuted }}>Presets</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {FILTERS.map(f => (
                      <button key={f.name}
                        onClick={() => { setBrightness(f.b); setContrast(f.c); setSaturation(f.s); setBlur(f.bl) }}
                        className="py-1.5 rounded text-xs font-medium transition-all"
                        style={{ background: palette.border, color: palette.text }}>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Done */}
                <button onClick={() => setEditing(null)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-auto"
                  style={{ background: palette.accent }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  )
}
