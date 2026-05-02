-- Link Supabase auth users to store customers
alter table customers add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create index if not exists customers_auth_user_id_idx on customers(auth_user_id);

-- Saved addresses table
create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null default 'Home',
  first_name text not null,
  last_name text not null,
  company text,
  address1 text not null,
  address2 text,
  city text not null,
  state text not null,
  zip text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists customer_addresses_customer_id_idx on customer_addresses(customer_id);

-- RLS
alter table customer_addresses enable row level security;

create policy "Customers can manage own addresses"
  on customer_addresses for all
  using (
    customer_id = (
      select id from customers where auth_user_id = auth.uid() limit 1
    )
  );

-- Allow customers to read their own orders
create policy "Customers can read own orders"
  on orders for select
  using (
    customer_id = (
      select id from customers where auth_user_id = auth.uid() limit 1
    )
  );

-- RLS on customers — can read/update own row
create policy "Customers can read own profile"
  on customers for select
  using (auth_user_id = auth.uid());

create policy "Customers can update own profile"
  on customers for update
  using (auth_user_id = auth.uid());
