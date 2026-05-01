'use client'
import { useState } from 'react'
import { Product, ProductVariant } from '@/types'
import { X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react'
import Image from 'next/image'

interface Props {
  product: Product
  onClose: () => void
  onAddToCart: (item: { product_id: string; variant_id?: string; name: string; variant_name?: string; price: number; quantity: number; image_url?: string }) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)

  const images = product.images || []
  const price = selectedVariant?.price ?? product.price
  const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price

  const handleAdd = () => {
    onAddToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id,
      name: product.name,
      variant_name: selectedVariant?.name,
      price,
      quantity,
      image_url: images[imgIndex]?.url,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
          <X size={18} />
        </button>
        <div className="grid md:grid-cols-2 gap-0">
          {/* Images */}
          <div className="relative aspect-square bg-gray-100">
            {images.length > 0 ? (
              <>
                <Image src={images[imgIndex].url} alt={product.name} fill className="object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full">
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'w-4' : 'bg-white/60'}`}
                          style={{ background: i === imgIndex ? 'var(--brand-accent)' : '' }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20 text-6xl">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{product.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                {comparePrice && comparePrice > price && (
                  <span className="text-sm opacity-40 line-through">${comparePrice.toFixed(2)}</span>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-sm opacity-70 leading-relaxed">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-60">Options</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-sm border rounded transition-all ${selectedVariant?.id === v.id ? 'border-transparent text-white' : 'hover:border-gray-400'}`}
                      style={selectedVariant?.id === v.id ? { background: 'var(--brand-primary)', borderColor: 'var(--brand-primary)' } : {}}>
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-60">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button onClick={handleAdd}
              className="w-full py-4 font-semibold text-sm tracking-widest uppercase rounded transition-all hover:opacity-90 text-white mt-auto"
              style={{ background: 'var(--brand-primary)' }}>
              Add to Cart — ${(price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
