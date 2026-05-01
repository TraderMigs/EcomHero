'use client'
import { useState } from 'react'
import { StoreSettings, Page, Product } from '@/types'
import StoreHeader from './StoreHeader'
import StoreHero from './StoreHero'
import ProductGrid from './ProductGrid'
import ProductModal from './ProductModal'
import StoreFooter from './StoreFooter'
import Cart from './Cart'
import AnnouncementBar from './AnnouncementBar'

interface Props {
  settings: StoreSettings
  page: Page | null
  products: Product[]
  navMenus: { location: string; items: { label: string; href: string }[] }[]
}

export default function StoreFront({ settings, page, products, navMenus }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<{
    product_id: string; variant_id?: string; name: string;
    variant_name?: string; price: number; quantity: number; image_url?: string;
  }[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const headerMenu = navMenus.find(m => m.location === 'header')?.items || []
  const footerMenu = navMenus.find(m => m.location === 'footer')?.items || []

  const addToCart = (item: typeof cartItems[0]) => {
    setCartItems(prev => {
      const key = `${item.product_id}-${item.variant_id || ''}`
      const existing = prev.find(i => `${i.product_id}-${i.variant_id || ''}` === key)
      if (existing) {
        return prev.map(i => `${i.product_id}-${i.variant_id || ''}` === key
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
        )
      }
      return [...prev, item]
    })
    setCartOpen(true)
  }

  const updateQty = (productId: string, variantId: string | undefined, qty: number) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => !(i.product_id === productId && i.variant_id === variantId)))
    } else {
      setCartItems(prev => prev.map(i =>
        i.product_id === productId && i.variant_id === variantId ? { ...i, quantity: qty } : i
      ))
    }
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-secondary)', color: 'var(--brand-primary)' }}>
      {settings.announcement_bar_active && settings.announcement_bar && (
        <AnnouncementBar text={settings.announcement_bar} />
      )}
      <StoreHeader
        settings={settings}
        navItems={headerMenu}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />
      <main>
        {page && (
          <StoreHero
            heading={page.hero_heading || settings.store_name}
            subheading={page.hero_subheading || settings.tagline}
            ctaText={page.hero_cta_text || 'Shop Now'}
            ctaLink={page.hero_cta_link || '#products'}
            imageUrl={page.hero_image_url}
          />
        )}
        <section id="products" className="py-16 px-4 max-w-7xl mx-auto">
          <ProductGrid
            products={products}
            onProductClick={setSelectedProduct}
            onAddToCart={addToCart}
          />
        </section>
      </main>
      <StoreFooter settings={settings} navItems={footerMenu} />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
      <Cart
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        settings={settings}
      />
    </div>
  )
}
