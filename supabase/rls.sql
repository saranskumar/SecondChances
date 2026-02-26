-- ============================================================
-- Second Chances – Row Level Security (Unified User Model)
-- Run AFTER schema.sql
-- ============================================================

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
-- Any authenticated user can insert (list) a product
create policy "Products: anyone can read" on public.products
  for select using (true);

create policy "Products: authenticated user can insert" on public.products
  for insert with check (auth.uid() = user_id);

create policy "Products: user can update own listing" on public.products
  for update using (auth.uid() = user_id);

create policy "Products: user can delete own available listing" on public.products
  for delete using (auth.uid() = user_id);

-- ── Orders ────────────────────────────────────────────────
-- user_id on orders = the buyer
create policy "Orders: buyer can read own" on public.orders
  for select using (auth.uid() = user_id);

create policy "Orders: buyer can insert" on public.orders
  for insert with check (auth.uid() = user_id);

-- The lister of a product can see orders that contain their product
create policy "Orders: lister can see orders with their products" on public.orders
  for select using (
    exists (
      select 1 from public.order_items oi
      join public.products p on oi.product_id = p.id
      where oi.order_id = orders.id and p.user_id = auth.uid()
    )
  );

-- ── Order Items ──────────────────────────────────────────
create policy "OrderItems: buyer can read own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

create policy "OrderItems: lister can read items of their products" on public.order_items
  for select using (
    exists (
      select 1 from public.products p
      where p.id = order_items.product_id and p.user_id = auth.uid()
    )
  );

-- ── Payments ─────────────────────────────────────────────
create policy "Payments: buyer can read own" on public.payments
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = payments.order_id and o.user_id = auth.uid()
    )
  );
