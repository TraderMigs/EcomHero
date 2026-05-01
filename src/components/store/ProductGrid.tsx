'use client'
import { Product } from '@/types'
import Image from 'next/image'
import { ShoppingBag, Eye } from 'lucide-react'

interface Props {
  products: Product[]
  onProductClick: (p: Product) => void
  onAddToCart: (item: { product_id: string; name: string; price: number; quantity: number; image_url?: string }) => void
}

export default function ProductGrid({ products, onProductClick, onAddToCart }: Props) {
  if (!products.length) {
    return (
      <div className="text-center py-24 opacity-40">
        <ShoppingBag size={48} className="mx-auto mb-4" />
        <p className="text-lg">No products yet</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-10 text-center" style={{ fontFamily: 'var(--font-display)' }}>
        Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => {
          const image = product.images?.[0]?.url
          const hasVariants = (product.variants?.length || 0) > 0
          return (
            <div key={product.id}
              className="group rounded-lg overflow-hidden border transition-all hover:shadow-lg cursor-pointer"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100" onClick={() => onProductClick(product)}>
                {image ? (
                  <Image src={image} alt={product.name} fill className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <ShoppingBag size={48} />
                  </div>
                )}
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded text-white" style={{ background: 'var(--brand-accent)' }}>
                    SALE
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {product.name}
                </h3>
                {product.short_description && (
                  <p className="text-xs opacity-60 mb-3 line-clamp-2">{product.short_description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-base">${product.price.toFixed(2)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-xs opacity-40 line-through ml-2">${product.compare_at_price.toFixed(2)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => hasVariants ? onProductClick(product) : onAddToCart({
                      product_id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image_url: image,
                    })}
                    className="text-xs font-semibold px-3 py-2 rounded transition-all hover:opacity-80 text-white"
                    style={{ background: 'var(--brand-primary)' }}>
                    {hasVariants ? 'Options' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
