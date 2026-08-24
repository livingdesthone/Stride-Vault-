create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  delivery_location text not null,
  landmark text,
  items jsonb not null,
  total_amount numeric(12,2) not null,
  status text not null default 'Paid'
    check (status in ('Paid','Processing','Delivered','Cancelled')),
  paystack_paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

-- The dashboard uses the Supabase service-role key on the server.
-- Do not expose that key in the browser.
alter table public.orders enable row level security;
