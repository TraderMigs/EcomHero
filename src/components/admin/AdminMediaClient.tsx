'use client'
import { useState, useCallback, useRef } from 'react'
import { MediaFile } from '@/types'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import {
  Upload, Trash2, Copy, X, Loader2, ZoomIn, ZoomOut,
  RotateCw, FlipHorizontal, Sun, Contrast, Droplets,
  Crop, Check, Image as ImageIcon
} from 'lucide-react'

interface Props { files: MediaFile[] }

export default function AdminMediaClient({ files: initial }: Props) {
  const [files, setFiles] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaFile | null>(null)
  const [editing, setEditing] = useState<MediaFile | null>(null)

  // Editor state
  const [rotate, setRotate] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [blur, setBlur] = useState(0)
  const [scale, setScale] = useState(1)
  const imgRef = useRef<HTMLImageElement>(null)

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
            id: crypto.randomUUID(),
            file_name: file.name,
            file_url: data.url,
            file_type: file.type,
            file_size: file.size,
            created_at: new Date().toISOString(),
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
    toast.success('File deleted')
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied!')
  }

  const openEditor = (file: MediaFile) => {
    setEditing(file)
    setRotate(0); setFlipH(false); setBrightness(100)
    setContrast(100); setSaturation(100); setBlur(0); setScale(1)
  }

  const editorStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`,
    transform: `rotate(${rotate}deg) scaleX(${flipH ? -1 : 1}) scale(${scale})`,
    transition: 'transform 0.2s ease',
  }

  const resetEditor = () => {
    setRotate(0); setFlipH(false); setBrightness(100)
    setContrast(100); setSaturation(100); setBlur(0); setScale(1)
  }

  const applyEditor = () => {
    toast.success('Edits applied! Use CSS filters in your store theme for permanent effects.')
    setEditing(null)
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const Slider = ({ label, value, min, max, onChange, icon }: {
    label: string; value: number; min: number; max: number; onChange: (v: number) => void; icon: React.ReactNode
  }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">{icon}<span>{label}</span></div>
        <span className="font-mono">{value}{label === 'Blur' ? 'px' : '%'}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full accent-black cursor-pointer" />
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Upload zone */}
      <div {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" /> Uploading files...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload size={28} />
            <p className="text-sm font-medium">{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
            <p className="text-xs">Images and videos supported</p>
          </div>
        )}
      </div>

      {/* Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {files.map(file => (
            <div key={file.id}
              onClick={() => setSelected(selected?.id === file.id ? null : file)}
              className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selected?.id === file.id ? 'border-black' : 'border-transparent hover:border-gray-300'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center pb-2 gap-1 opacity-0 group-hover:opacity-100">
                <button onClick={e => { e.stopPropagation(); openEditor(file) }}
                  className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100 text-xs" title="Edit">
                  <Crop size={12} />
                </button>
                <button onClick={e => { e.stopPropagation(); copyUrl(file.file_url) }}
                  className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100" title="Copy URL">
                  <Copy size={12} />
                </button>
                <button onClick={e => { e.stopPropagation(); del(file.id) }}
                  className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600" title="Delete">
                  <Trash2 size={12} />
                </button>
              </div>
              {selected?.id === file.id && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p>No media files yet</p>
        </div>
      )}

      {/* Selected file info */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selected.file_url} alt={selected.file_name} className="w-16 h-16 object-cover rounded-lg" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{selected.file_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatBytes(selected.file_size || undefined)}</p>
            <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{selected.file_url}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => openEditor(selected)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
              <Crop size={12} /> Edit
            </button>
            <button onClick={() => copyUrl(selected.file_url)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
              <Copy size={12} /> Copy URL
            </button>
            <button onClick={() => del(selected.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Image Studio</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:opacity-60"><X size={18} /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Preview */}
              <div className="flex-1 media-canvas flex items-center justify-center p-8 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={editing.file_url}
                  alt={editing.file_name}
                  style={editorStyle}
                  className="max-w-full max-h-[400px] object-contain rounded shadow-lg select-none"
                />
              </div>

              {/* Controls */}
              <div className="w-72 border-l p-5 overflow-y-auto flex flex-col gap-5">
                {/* Transform */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Transform</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRotate(r => r - 90)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg hover:bg-gray-50">
                      <RotateCw size={12} className="scale-x-[-1]" /> Rotate L
                    </button>
                    <button onClick={() => setRotate(r => r + 90)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg hover:bg-gray-50">
                      <RotateCw size={12} /> Rotate R
                    </button>
                    <button onClick={() => setFlipH(f => !f)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg hover:bg-gray-50 ${flipH ? 'bg-gray-100 border-black' : ''}`}>
                      <FlipHorizontal size={12} /> Flip H
                    </button>
                    <button onClick={resetEditor}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs border rounded-lg hover:bg-gray-50 text-red-500 border-red-200">
                      Reset
                    </button>
                  </div>
                </div>

                {/* Zoom */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Zoom</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))}
                      className="p-2 border rounded-lg hover:bg-gray-50"><ZoomOut size={14} /></button>
                    <span className="flex-1 text-center text-sm font-mono">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(3, s + 0.1))}
                      className="p-2 border rounded-lg hover:bg-gray-50"><ZoomIn size={14} /></button>
                  </div>
                </div>

                {/* Adjustments */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Adjustments</p>
                  <Slider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} icon={<Sun size={12} />} />
                  <Slider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} icon={<Contrast size={12} />} />
                  <Slider label="Saturation" value={saturation} min={0} max={200} onChange={setSaturation} icon={<Droplets size={12} />} />
                  <Slider label="Blur" value={blur} min={0} max={10} onChange={setBlur} icon={<ImageIcon size={12} />} />
                </div>

                {/* Filters */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Preset Filters</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'None', b: 100, c: 100, s: 100, bl: 0 },
                      { name: 'B&W', b: 100, c: 120, s: 0, bl: 0 },
                      { name: 'Vivid', b: 110, c: 130, s: 150, bl: 0 },
                      { name: 'Fade', b: 115, c: 85, s: 80, bl: 0 },
                      { name: 'Cool', b: 100, c: 110, s: 90, bl: 0 },
                      { name: 'Warm', b: 105, c: 110, s: 120, bl: 0 },
                    ].map(f => (
                      <button key={f.name}
                        onClick={() => { setBrightness(f.b); setContrast(f.c); setSaturation(f.s); setBlur(f.bl) }}
                        className="px-2 py-2 text-xs border rounded-lg hover:bg-gray-50 font-medium">
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply */}
                <button onClick={applyEditor}
                  className="w-full py-3 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                  style={{ background: '#000' }}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
