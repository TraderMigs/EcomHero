-- EcomHero Full Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- STORE SETTINGS (one row per store)
-- ============================================================
create table if not exists store_settings (
  id uuid primary key default uuid_generate_v4(),
  store_name text not null default 'My Store',
  tagline text,
  logo_url text,
  favicon_url text,
  primary_color text default '#000000',
  secondary_color text default '#ffffff',
  accent_color text default '#ff4500',
  font_display text default 'Playfair Display',
  font_body text default 'Inter',
  store_type text default 'single' check (store_type in ('single','catalog','full')),
  onboarding_complete boolean default false,
  stripe_publishable_key text,
  stripe_secret_key_enc text,
  stripe_webhook_secret_enc text,
  resend_api_key_enc text,
  contact_email text,
  support_email text,
  social_instagram text,
  social_tiktok text,
  social_facebook text,
  meta_title text,
  meta_description text,
  footer_text text,
  announcement_bar text,
  announcement_bar_active boolean default false,
  pod_provider text check (pod_provider in ('none','printful','printify')),
  pod_api_key_enc text,
  pod_shop_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ADMIN USERS
-- ============================================================
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'admin' check (role in ('owner','admin','editor')),
  created_at timestamptz default now()
);

-- ============================================================
-- PAGES
-- ============================================================
create table if not exists pages (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  page_type text default 'custom' check (page_type in ('home','product','catalog','about','contact','custom','faq','policy')),
  is_active boolean default true,
  sort_order integer default 0,
  show_in_nav boolean default true,
  nav_label text,
  meta_title text,
  meta_description text,
  hero_image_url text,
  hero_heading text,
  hero_subheading text,
  hero_cta_text text,
  hero_cta_link text,
  content jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  cost_per_item numeric(10,2),
  sku text,
  barcode text,
  track_inventory boolean default false,
  inventory_quantity integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  sort_order integer default 0,
  images jsonb default '[]',
  tags text[],
  category text,
  weight numeric(8,2),
  weight_unit text default 'lb',
  requires_shipping boolean default true,
  taxable boolean default true,
  page_id uuid references pages(id),
  pod_provider text,
  pod_product_id text,
  pod_sync_variant_id text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  options jsonb default '{}',
  price numeric(10,2),
  compare_at_price numeric(10,2),
  sku text,
  inventory_quantity integer default 0,
  image_url text,
  pod_variant_id text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  stripe_customer_id text,
  accepts_marketing boolean default false,
  tags text[],
  notes text,
  total_orders integer default 0,
  total_spent numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  customer_id uuid references customers(id),
  customer_email text not null,
  status text default 'pending' check (status in ('pending','processing','fulfilled','shipped','delivered','cancelled','refunded')),
  financial_status text default 'pending' check (financial_status in ('pending','paid','refunded','partially_refunded','voided')),
  fulfillment_status text default 'unfulfilled' check (fulfillment_status in ('unfulfilled','partial','fulfilled','restocked')),
  line_items jsonb default '[]',
  subtotal numeric(10,2) default 0,
  shipping_total numeric(10,2) default 0,
  tax_total numeric(10,2) default 0,
  discount_total numeric(10,2) default 0,
  total numeric(10,2) default 0,
  currency text default 'USD',
  shipping_address jsonb,
  billing_address jsonb,
  stripe_payment_intent_id text,
  stripe_session_id text,
  pod_order_id text,
  pod_provider text,
  tracking_number text,
  tracking_url text,
  notes text,
  discount_code text,
  discount_amount numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
create table if not exists discount_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text default 'percentage' check (type in ('percentage','fixed')),
  value numeric(10,2) not null,
  min_order_amount numeric(10,2) default 0,
  max_uses integer,
  uses_count integer default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================
create table if not exists media_library (
  id uuid primary key default uuid_generate_v4(),
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  width integer,
  height integer,
  alt_text text,
  tags text[],
  created_at timestamptz default now()
);

-- ============================================================
-- NAVIGATION MENUS
-- ============================================================
create table if not exists nav_menus (
  id uuid primary key default uuid_generate_v4(),
  location text unique not null,
  items jsonb default '[]',
  updated_at timestamptz default now()
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  page_slug text,
  product_id uuid,
  session_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- EMAIL SUBSCRIBERS
-- ============================================================
create table if not exists email_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  source text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- DEFAULT DATA
-- ============================================================
insert into store_settings (store_name, tagline, store_type, onboarding_complete)
values ('My EcomHero Store', 'Built with EcomHero', 'single', false)
on conflict do nothing;

insert into pages (slug, title, page_type, sort_order, show_in_nav, nav_label, hero_heading, hero_subheading, hero_cta_text)
values 
  ('home', 'Home', 'home', 0, true, 'Home', 'Welcome to Our Store', 'Discover our products', 'Shop Now'),
  ('about', 'About Us', 'about', 1, true, 'About', null, null, null),
  ('contact', 'Contact', 'contact', 2, true, 'Contact', null, null, null),
  ('faq', 'FAQ', 'faq', 3, false, 'FAQ', null, null, null),
  ('privacy-policy', 'Privacy Policy', 'policy', 4, false, 'Privacy', null, null, null),
  ('terms', 'Terms of Service', 'policy', 5, false, 'Terms', null, null, null)
on conflict (slug) do nothing;

insert into nav_menus (location, items)
values 
  ('header', '[{"label":"Home","href":"/"},{"label":"Shop","href":"/shop"},{"label":"About","href":"/about"},{"label":"Contact","href":"/contact"}]'),
  ('footer', '[{"label":"Privacy Policy","href":"/privacy-policy"},{"label":"Terms","href":"/terms"},{"label":"FAQ","href":"/faq"}]')
on conflict (location) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table store_settings enable row level security;
alter table admin_users enable row level security;
alter table pages enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table discount_codes enable row level security;
alter table media_library enable row level security;
alter table nav_menus enable row level security;
alter table analytics_events enable row level security;
alter table email_subscribers enable row level security;

-- Public read for storefront
create policy "Public read store_settings" on store_settings for select using (true);
create policy "Public read pages" on pages for select using (is_active = true);
create policy "Public read products" on products for select using (is_active = true);
create policy "Public read product_variants" on product_variants for select using (is_active = true);
create policy "Public read nav_menus" on nav_menus for select using (true);
create policy "Public insert analytics" on analytics_events for insert with check (true);
create policy "Public insert subscribers" on email_subscribers for insert with check (true);

-- Service role full access (used by API routes)
create policy "Service full access store_settings" on store_settings using (auth.role() = 'service_role');
create policy "Service full access pages" on pages using (auth.role() = 'service_role');
create policy "Service full access products" on products using (auth.role() = 'service_role');
create policy "Service full access variants" on product_variants using (auth.role() = 'service_role');
create policy "Service full access customers" on customers using (auth.role() = 'service_role');
create policy "Service full access orders" on orders using (auth.role() = 'service_role');
create policy "Service full access discounts" on discount_codes using (auth.role() = 'service_role');
create policy "Service full access media" on media_library using (auth.role() = 'service_role');
create policy "Service full access nav" on nav_menus using (auth.role() = 'service_role');
create policy "Service full access analytics" on analytics_events using (auth.role() = 'service_role');
create policy "Service full access subscribers" on email_subscribers using (auth.role() = 'service_role');
create policy "Service full access admin" on admin_users using (auth.role() = 'service_role');

-- Storage bucket
insert into storage.buckets (id, name, public) values ('ecomhero-media', 'ecomhero-media', true) on conflict do nothing;
create policy "Public media read" on storage.objects for select using (bucket_id = 'ecomhero-media');
create policy "Service media upload" on storage.objects for insert with check (bucket_id = 'ecomhero-media');
create policy "Service media delete" on storage.objects for delete using (bucket_id = 'ecomhero-media');
