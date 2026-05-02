'use client'
import { Product } from '@/types'
import Image from 'next/image'

interface Props {
  currentProduct: Product
  allProducts: Product[]
  onProductClick: (p: Product) => void
}

export default function RelatedProducts({ currentProduct, allProducts, onProductClick }: Props) {
  // Match by same category first, then by shared tags — exclude current product
  const related = allProducts
    .filter(p => p.id !== currentProduct.id && p.is_active)
    .map(p => {
      let score = 0
      if (p.category && p.category === currentProduct.category) score += 3
      const sharedTags = p.tags?.filter(t => currentProduct.tags?.includes(t)) || []
      score += sharedTags.length
      return { product: p, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product }) => product)

  if (related.length === 0) return null

  return (
    <div className="border-t mt-6 pt-6" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4 opacity-50">
        You may also like
      </p>
      <div className="grid grid-cols-4 gap-3">
        {related.map(p => {
          const image = p.images?.[0]?.url
          return (
            <button key={p.id}
              onClick={() => onProductClick(p)}
              className="group text-left rounded-lg overflow-hidden border transition-all hover:shadow-md"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {image ? (
                  <Image src={image} alt={p.name} fill
                    className="object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-2xl">📦</div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-semibold line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {p.name}
                </p>
                <p className="text-xs font-bold mt-0.5">${p.price.toFixed(2)}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
