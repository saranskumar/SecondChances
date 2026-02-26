-- ============================================================
-- Second Chances – Database Schema
-- Run in Supabase SQL Editor (public schema)
-- ============================================================

-- ── Profiles (extends auth.users) ─────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);
comment on table public.profiles is 'Public profile data for every authenticated user. All users can both buy and sell.';

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Categories ────────────────────────────────────────────
create table if not exists public.categories (
  id         serial primary key,
  name       text not null,
  slug       text not null unique
);

insert into public.categories (name, slug) values
  ('Tops',        'tops'),
  ('Bottoms',     'bottoms'),
  ('Dresses',     'dresses'),
  ('Outerwear',   'outerwear'),
  ('Accessories', 'accessories'),
  ('Shoes',       'shoes'),
  ('Bags',        'bags'),
  ('Vintage',     'vintage')
on conflict (slug) do nothing;

-- ── Products ─────────────────────────────────────────────
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles (id) on delete cascade,
  category_id   int  not null references public.categories (id),
  title         text not null,
  description   text,
  price         numeric(10, 2) not null check (price > 0),
  condition     text not null default 'good' check (condition in ('like_new', 'good', 'fair')),
  status        text not null default 'available' check (status in ('available', 'sold')),
  image_urls    text[] not null default '{}',
  created_at    timestamptz not null default now()
);
create index if not exists products_status_idx      on public.products (status);
create index if not exists products_category_idx    on public.products (category_id);
create index if not exists products_seller_idx      on public.products (seller_id);

-- ── Orders ───────────────────────────────────────────────
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  buyer_id      uuid not null references public.profiles (id) on delete cascade,
  total_amount  numeric(10, 2) not null check (total_amount >= 0),
  status        text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  shipping_name    text,
  shipping_address text,
  shipping_city    text,
  shipping_phone   text,
  created_at    timestamptz not null default now()
);
create index if not exists orders_buyer_idx on public.orders (buyer_id);

-- ── Order Items ──────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  uuid not null references public.products (id),
  price_at_purchase numeric(10, 2) not null,
  -- Core business rule: each product can only be sold once
  constraint unique_product_sale unique (product_id)
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ── Payments ─────────────────────────────────────────────
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  amount        numeric(10, 2) not null,
  provider      text not null default 'cod',
  provider_ref  text,
  status        text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at    timestamptz not null default now()
);

-- ── Atomic: place_order ──────────────────────────────────
-- Params: p_buyer_id, p_product_ids (array), p_shipping_*
-- Returns: order_id
create or replace function public.place_order(
  p_buyer_id       uuid,
  p_product_ids    uuid[],
  p_shipping_name    text default '',
  p_shipping_address text default '',
  p_shipping_city    text default '',
  p_shipping_phone   text default ''
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_order_id   uuid;
  v_total      numeric(10,2) := 0;
  v_product_id uuid;
  v_price      numeric(10,2);
begin
  -- Validate all products are available
  foreach v_product_id in array p_product_ids loop
    select price into v_price
    from public.products
    where id = v_product_id and status = 'available'
    for update; -- lock row

    if not found then
      raise exception 'Product % is not available', v_product_id;
    end if;
    v_total := v_total + v_price;
  end loop;

  -- Create order
  insert into public.orders (buyer_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_phone)
  values (p_buyer_id, v_total, 'paid', p_shipping_name, p_shipping_address, p_shipping_city, p_shipping_phone)
  returning id into v_order_id;

  -- Insert order items + mark products sold
  foreach v_product_id in array p_product_ids loop
    select price into v_price from public.products where id = v_product_id;

    insert into public.order_items (order_id, product_id, price_at_purchase)
    values (v_order_id, v_product_id, v_price);

    update public.products set status = 'sold' where id = v_product_id;
  end loop;

  -- Record payment (COD by default)
  insert into public.payments (order_id, amount, provider, status)
  values (v_order_id, v_total, 'cod', 'pending');

  return v_order_id;
end;
$$;
