-- ============================================================
-- Second Chances – Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.categories  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.payments    enable row level security;

-- ── Profiles ──────────────────────────────────────────────
create policy "Profiles: anyone can read" on public.profiles
  for select using (true);

create policy "Profiles: user can update own" on public.profiles
  for update using (auth.uid() = id);

-- ── Categories ────────────────────────────────────────────
create policy "Categories: anyone can read" on public.categories
  for select using (true);

-- ── Products ──────────────────────────────────────────────
create policy "Products: anyone can read available" on public.products
  for select using (true);

create policy "Products: seller can insert" on public.products
  for insert with check (auth.uid() = seller_id);

create policy "Products: seller can update own" on public.products
  for update using (auth.uid() = seller_id);

create policy "Products: seller can delete own" on public.products
  for delete using (auth.uid() = seller_id);

-- ── Orders ────────────────────────────────────────────────
create policy "Orders: buyer can read own" on public.orders
  for select using (auth.uid() = buyer_id);

create policy "Orders: buyer can insert" on public.orders
  for insert with check (auth.uid() = buyer_id);

-- Sellers can see orders that contain their products
create policy "Orders: seller can read orders with their products" on public.orders
  for select using (
    exists (
      select 1 from public.order_items oi
      join public.products p on oi.product_id = p.id
      where oi.order_id = orders.id and p.seller_id = auth.uid()
    )
  );

-- ── Order Items ──────────────────────────────────────────
create policy "OrderItems: buyer can read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.buyer_id = auth.uid()
    )
  );

create policy "OrderItems: seller can read items of their products" on public.order_items
  for select using (
    exists (
      select 1 from public.products p
      where p.id = order_items.product_id and p.seller_id = auth.uid()
    )
  );

-- ── Payments ─────────────────────────────────────────────
create policy "Payments: buyer can read own" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.buyer_id = auth.uid()
    )
  );
