'use client'
import { useState } from 'react'
import { Product, ProductVariant } from '@/types'
import { X, ChevronLeft, ChevronRight, Plus, Minus, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import RelatedProducts from './RelatedProducts'
import ProductReviews from './ProductReviews'
import WishlistButton from './WishlistButton'

interface Props {
  product: Product
  allProducts: Product[]
  onClose: () => void
  onProductClick: (p: Product) => void
  onAddToCart: (item: {
    product_id: string; variant_id?: string; name: string
    variant_name?: string; price: number; quantity: number; image_url?: string
  }) => void
}

export default function ProductModal({ product, allProducts, onClose, onProductClick, onAddToCart }: Props) {
  const activeVariants = (product.variants || []).filter(v => v.is_active)
  const hasVariants = activeVariants.length > 0

  // If variants exist, require explicit selection — start with null so buyer must choose
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? null : null
  )
  const [quantity, setQuantity] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)
  const [noVariantError, setNoVariantError] = useState(false)

  const images = product.images || []
  const price = selectedVariant?.price ?? product.price
  const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price

  const handleAdd = () => {
    if (hasVariants && !selectedVariant) {
      setNoVariantError(true)
      return
    }
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

  const selectVariant = (v: ProductVariant) => {
    setSelectedVariant(v)
    setNoVariantError(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
          <X size={18} />
        </button>
        {/* Wishlist button */}
        <div className="absolute top-4 right-14 z-20 p-2 bg-white rounded-full shadow-md">
          <WishlistButton productId={product.id} />

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
                          className="w-2 h-2 rounded-full transition-all"
                          style={{ background: i === imgIndex ? 'var(--brand-accent)' : 'rgba(255,255,255,0.6)', width: i === imgIndex ? '16px' : '8px' }} />
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
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h2>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                {comparePrice && comparePrice > price && (
                  <span className="text-sm opacity-40 line-through">${comparePrice.toFixed(2)}</span>
                )}
              </div>
              {/* Show selected variant under price */}
              {selectedVariant && (
                <p className="text-sm mt-1 font-medium" style={{ color: 'var(--brand-accent)' }}>
                  {selectedVariant.name}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm opacity-70 leading-relaxed">{product.description}</p>
            )}

            {/* Variant selector */}
            {hasVariants && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
                    Options
                  </p>
                  {!selectedVariant && (
                    <p className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
                      Please select one
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map(v => {
                    const isSelected = selectedVariant?.id === v.id
                    const outOfStock = product.track_inventory && v.inventory_quantity === 0
                    return (
                      <button key={v.id}
                        onClick={() => !outOfStock && selectVariant(v)}
                        disabled={outOfStock}
                        className={`px-4 py-2 text-sm border-2 rounded-lg transition-all relative ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'hover:border-current'}`}
                        style={{
                          background: isSelected ? 'var(--brand-primary)' : 'transparent',
                          borderColor: isSelected ? 'var(--brand-primary)' : noVariantError ? 'var(--brand-accent)' : '#e5e7eb',
                          color: isSelected ? 'var(--brand-secondary)' : 'var(--brand-primary)',
                        }}>
                        {v.name}
                        {v.price && v.price !== product.price && (
                          <span className="ml-1 text-xs opacity-70">+${(v.price - product.price).toFixed(0)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Error state if they try to add without selecting */}
                {noVariantError && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium"
                    style={{ color: 'var(--brand-accent)' }}>
                    <AlertCircle size={13} />
                    Please select an option before adding to cart
                  </div>
                )}
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

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className="w-full py-4 font-semibold text-sm tracking-widest uppercase rounded transition-all mt-auto"
              style={{
                background: hasVariants && !selectedVariant ? '#e5e7eb' : 'var(--brand-primary)',
                color: hasVariants && !selectedVariant ? '#9ca3af' : 'var(--brand-secondary)',
                cursor: hasVariants && !selectedVariant ? 'not-allowed' : 'pointer',
              }}>
              {hasVariants && !selectedVariant
                ? 'Select an option'
                : `Add to Cart — $${(price * quantity).toFixed(2)}`
              }
            </button>
          </div>
        </div>
        {/* Related products — clicking swaps to that product */}
        <div className="px-8 pb-4">
          <RelatedProducts
            currentProduct={product}
            allProducts={allProducts}
            onProductClick={onProductClick}
          />
        </div>
        {/* Reviews */}
        <div className="px-8 pb-8">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </div>
    </div>
  )
}
