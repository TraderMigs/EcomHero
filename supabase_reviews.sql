-- Product reviews table
create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists product_reviews_product_id_idx on product_reviews(product_id);
create index if not exists product_reviews_approved_idx on product_reviews(is_approved);

-- RLS
alter table product_reviews enable row level security;

-- Public can read approved reviews
create policy "Public can read approved reviews"
  on product_reviews for select
  using (is_approved = true);

-- Anyone can submit a review
create policy "Anyone can submit a review"
  on product_reviews for insert
  with check (true);

-- Service role can do everything (admin approval/deletion)
create policy "Service role full access"
  on product_reviews for all
  using (auth.role() = 'service_role');
