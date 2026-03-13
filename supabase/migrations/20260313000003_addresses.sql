-- ============================================================
-- Second Chances – Saved Addresses
-- Users can store multiple delivery addresses on their profile.
-- ============================================================

create table if not exists public.addresses (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.profiles (id) on delete cascade,
    label       text not null default 'Home',   -- e.g. "Home", "Office"
    full_name   text not null,
    phone       text not null,
    address     text not null,
    city        text not null,
    is_default  boolean not null default false,
    created_at  timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.addresses enable row level security;

create policy "Addresses: user can read own"
    on public.addresses for select
    using (auth.uid() = user_id);

create policy "Addresses: user can insert own"
    on public.addresses for insert
    with check (auth.uid() = user_id);

create policy "Addresses: user can update own"
    on public.addresses for update
    using (auth.uid() = user_id);

create policy "Addresses: user can delete own"
    on public.addresses for delete
    using (auth.uid() = user_id);
