-- Abandoned carts table
create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  customer_name text,
  items jsonb not null default '[]',
  total numeric not null default 0,
  email_sent boolean not null default false,
  recovered boolean not null default false,
  send_after timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists abandoned_carts_send_after_idx on abandoned_carts(send_after) where email_sent = false and recovered = false;
create index if not exists abandoned_carts_email_idx on abandoned_carts(email);

-- RLS — service role only
alter table abandoned_carts enable row level security;
create policy "Service role only" on abandoned_carts for all using (auth.role() = 'service_role');

-- Mark abandoned cart as recovered when order is placed
-- (called from webhook after successful checkout with matching email)
create or replace function mark_cart_recovered(customer_email text)
returns void language plpgsql security definer as $$
begin
  update abandoned_carts set recovered = true where email = customer_email;
end;
$$;

-- Ensure email_subscribers has needed indexes
create index if not exists email_subscribers_active_idx on email_subscribers(is_active) where is_active = true;
create index if not exists email_subscribers_email_idx on email_subscribers(email);
