'use client'
import { useState, useMemo } from 'react'
import { Product } from '@/types'
import Image from 'next/image'
import { ShoppingBag, Eye, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

interface CartItem {
  product_id: string
  variant_id?: string
  name: string
  variant_name?: string
  price: number
  quantity: number
  image_url?: string
}

interface Props {
  products: Product[]
  onProductClick: (p: Product) => void
  onAddToCart: (item: CartItem) => void
}

type SortOption = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  newest: 'Newest',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A–Z',
}

export default function ProductGrid({ products, onProductClick, onAddToCart }: Props) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Derive category list from products
  const categories = useMemo(() => {
    const cats = Array.from(new Set(
      products.map(p => p.category).filter((c): c is string => !!c && c.trim() !== '')
    )).sort()
    return cats
  }, [products])

  // Max price in catalog for slider range
  const catalogMaxPrice = useMemo(() => {
    return Math.ceil(Math.max(...products.map(p => p.price), 0))
  }, [products])

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let list = [...products]

    // Search — name, description, tags, category
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory)
    }

    // Price filter
    if (maxPrice !== null) {
      list = list.filter(p => p.price <= maxPrice)
    }

    // Sort
    switch (sortBy) {
      case 'featured':
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || a.sort_order - b.sort_order)
        break
      case 'newest':
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        break
      case 'price_asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return list
  }, [products, query, selectedCategory, sortBy, maxPrice])

  const hasActiveFilters = query || selectedCategory !== 'all' || maxPrice !== null || sortBy !== 'featured'

  const clearAll = () => {
    setQuery('')
    setSelectedCategory('all')
    setSortBy('featured')
    setMaxPrice(null)
  }

  if (!products.length) {
    return (
      <div className="text-center py-24 opacity-40">
        <ShoppingBag size={48} className="mx-auto mb-4" />
        <p className="text-lg">No products yet</p>
      </div>
    )
  }

  return (
    <div id="products">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Our Products
          {filtered.length !== products.length && (
            <span className="text-base font-normal opacity-40 ml-3">
              ({filtered.length} of {products.length})
            </span>
          )}
        </h2>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border rounded-lg bg-transparent cursor-pointer"
            style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)', color: 'var(--brand-primary)' }}>
            {(Object.keys(SORT_LABELS) as SortOption[]).map(k => (
              <option key={k} value={k}>{SORT_LABELS[k]}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-9 py-2.5 text-sm border rounded-lg bg-transparent outline-none transition-colors"
            style={{
              borderColor: query
                ? 'var(--brand-accent)'
                : 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
              color: 'var(--brand-primary)',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        {(categories.length > 0 || catalogMaxPrice > 0) && (
          <button
            onClick={() => setFiltersOpen(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm border rounded-lg transition-all shrink-0"
            style={{
              borderColor: filtersOpen || (selectedCategory !== 'all' || maxPrice !== null)
                ? 'var(--brand-accent)'
                : 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
              color: 'var(--brand-primary)',
              background: filtersOpen ? 'color-mix(in srgb, var(--brand-accent) 8%, transparent)' : 'transparent',
            }}>
            <SlidersHorizontal size={14} />
            Filters
            {(selectedCategory !== 'all' || maxPrice !== null) && (
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
            )}
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="mb-6 p-5 rounded-xl border flex flex-col sm:flex-row gap-6"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }}>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-50">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-3 py-1.5 text-xs rounded-full border-2 transition-all font-medium"
                  style={{
                    background: selectedCategory === 'all' ? 'var(--brand-primary)' : 'transparent',
                    borderColor: selectedCategory === 'all' ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                    color: selectedCategory === 'all' ? 'var(--brand-secondary)' : 'var(--brand-primary)',
                  }}>
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 text-xs rounded-full border-2 transition-all font-medium capitalize"
                    style={{
                      background: selectedCategory === cat ? 'var(--brand-primary)' : 'transparent',
                      borderColor: selectedCategory === cat ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                      color: selectedCategory === cat ? 'var(--brand-secondary)' : 'var(--brand-primary)',
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price range */}
          {catalogMaxPrice > 0 && (
            <div className="sm:w-56">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-50">
                Max Price {maxPrice !== null && <span className="normal-case font-bold">— ${maxPrice}</span>}
              </p>
              <input
                type="range"
                min={0}
                max={catalogMaxPrice}
                value={maxPrice ?? catalogMaxPrice}
                onChange={e => setMaxPrice(parseInt(e.target.value) >= catalogMaxPrice ? null : parseInt(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: 'var(--brand-accent)' }}
              />
              <div className="flex justify-between text-xs opacity-40 mt-1">
                <span>$0</span>
                <span>${catalogMaxPrice}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {query && (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)', color: 'var(--brand-primary)' }}>
              &ldquo;{query}&rdquo;
              <button onClick={() => setQuery('')}><X size={11} /></button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium capitalize"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)', color: 'var(--brand-primary)' }}>
              {selectedCategory}
              <button onClick={() => setSelectedCategory('all')}><X size={11} /></button>
            </span>
          )}
          {maxPrice !== null && (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-medium"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)', color: 'var(--brand-primary)' }}>
              Up to ${maxPrice}
              <button onClick={() => setMaxPrice(null)}><X size={11} /></button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs opacity-50 hover:opacity-80 underline ml-1">
            Clear all
          </button>
        </div>
      )}

      {/* No results */}
      {filtered.length === 0 && (
        <div className="text-center py-20 opacity-40">
          <Search size={40} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">No products found</p>
          <p className="text-sm mt-2">Try adjusting your search or filters</p>
          <button onClick={clearAll} className="mt-4 text-sm underline opacity-70">Clear all filters</button>
        </div>
      )}

      {/* Product grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => {
            const image = product.images?.[0]?.url
            const hasVariants = (product.variants?.length || 0) > 0
            const onSale = product.compare_at_price && product.compare_at_price > product.price

            return (
              <div key={product.id}
                className="group rounded-xl overflow-hidden border transition-all hover:shadow-lg cursor-pointer flex flex-col"
                style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100"
                  onClick={() => onProductClick(product)}>
                  {image ? (
                    <Image
                      src={image} alt={product.name} fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <ShoppingBag size={48} />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {onSale && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ background: 'var(--brand-accent)' }}>SALE</span>
                    )}
                    {product.is_featured && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ background: 'var(--brand-primary)' }}>★ Featured</span>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-display)' }}>
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-xs opacity-40 mb-1 capitalize">{product.category}</p>
                  )}
                  {product.short_description && (
                    <p className="text-xs opacity-60 mb-3 line-clamp-2 flex-1">{product.short_description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div>
                      <span className="font-bold text-base">${product.price.toFixed(2)}</span>
                      {onSale && (
                        <span className="text-xs opacity-40 line-through ml-2">
                          ${product.compare_at_price!.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => hasVariants
                        ? onProductClick(product)
                        : onAddToCart({
                            product_id: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            image_url: image,
                          })
                      }
                      className="text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-80 text-white"
                      style={{ background: 'var(--brand-primary)' }}>
                      {hasVariants ? 'Options' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
