export interface StoreSettings {
  id: string
  store_name: string
  tagline?: string
  logo_url?: string
  favicon_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_display: string
  font_body: string
  store_type: 'single' | 'catalog' | 'full'
  onboarding_complete: boolean
  stripe_publishable_key?: string
  contact_email?: string
  support_email?: string
  social_instagram?: string
  social_tiktok?: string
  social_facebook?: string
  meta_title?: string
  meta_description?: string
  footer_text?: string
  announcement_bar?: string
  announcement_bar_active: boolean
  pod_provider?: 'none' | 'printful' | 'printify'
  pod_shop_id?: string
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  page_type: 'home' | 'product' | 'catalog' | 'about' | 'contact' | 'custom' | 'faq' | 'policy'
  is_active: boolean
  sort_order: number
  show_in_nav: boolean
  nav_label?: string
  meta_title?: string
  meta_description?: string
  hero_image_url?: string
  hero_heading?: string
  hero_subheading?: string
  hero_cta_text?: string
  hero_cta_link?: string
  content: ContentBlock[]
  created_at: string
  updated_at: string
}

export interface ContentBlock {
  id: string
  type: 'hero' | 'text' | 'image' | 'gallery' | 'products' | 'testimonials' | 'faq' | 'cta' | 'video' | 'divider'
  data: Record<string, unknown>
  sort_order: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  compare_at_price?: number
  cost_per_item?: number
  sku?: string
  track_inventory: boolean
  inventory_quantity: number
  is_active: boolean
  is_featured: boolean
  sort_order: number
  images: ProductImage[]
  tags?: string[]
  category?: string
  requires_shipping: boolean
  taxable: boolean
  page_id?: string
  pod_provider?: string
  pod_product_id?: string
  seo_title?: string
  seo_description?: string
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  sort_order: number
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  options: Record<string, string>
  price?: number
  compare_at_price?: number
  sku?: string
  inventory_quantity: number
  image_url?: string
  pod_variant_id?: string
  is_active: boolean
  sort_order: number
}

export interface Customer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  stripe_customer_id?: string
  accepts_marketing: boolean
  total_orders: number
  total_spent: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_email: string
  status: 'pending' | 'processing' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  financial_status: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'voided'
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled' | 'restocked'
  line_items: OrderLineItem[]
  subtotal: number
  shipping_total: number
  tax_total: number
  discount_total: number
  total: number
  currency: string
  shipping_address?: Address
  billing_address?: Address
  stripe_payment_intent_id?: string
  stripe_session_id?: string
  pod_order_id?: string
  pod_provider?: string
  tracking_number?: string
  tracking_url?: string
  notes?: string
  discount_code?: string
  discount_amount: number
  created_at: string
  updated_at: string
}

export interface OrderLineItem {
  product_id: string
  variant_id?: string
  name: string
  variant_name?: string
  quantity: number
  price: number
  image_url?: string
  sku?: string
}

export interface Address {
  first_name: string
  last_name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_amount: number
  max_uses?: number
  uses_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

export interface MediaFile {
  id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  width?: number
  height?: number
  alt_text?: string
  tags?: string[]
  created_at: string
}

export interface CartItem {
  product_id: string
  variant_id?: string
  name: string
  variant_name?: string
  price: number
  quantity: number
  image_url?: string
  sku?: string
}

export interface OnboardingData {
  store_name: string
  tagline: string
  logo_url?: string
  store_type: 'single' | 'catalog' | 'full'
  primary_color: string
  secondary_color: string
  accent_color: string
  pod_provider: 'none' | 'printful' | 'printify'
  pod_api_key?: string
  pod_shop_id?: string
  stripe_publishable_key?: string
  stripe_secret_key?: string
  contact_email?: string
}
