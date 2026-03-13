-- ============================================================
-- Second Chances – Storage: product-images bucket + RLS
-- Creates the public bucket and storage policies for product
-- image uploads. Run after schema.sql and rls.sql.
-- ============================================================

-- Create the bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'product-images',
    'product-images',
    true,
    10485760,   -- 10 MiB in bytes
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public             = excluded.public,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ── Storage RLS Policies ──────────────────────────────────

-- Anyone can view/download images (bucket is public)
create policy "product-images: public read"
    on storage.objects for select
    using (bucket_id = 'product-images');

-- Authenticated users can upload only to their own folder:
--   products/<their user_id>/...
create policy "product-images: authenticated upload"
    on storage.objects for insert
    with check (
        bucket_id = 'product-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = 'products'
        and (storage.foldername(name))[2] = auth.uid()::text
    );

-- Users can delete only their own files
create policy "product-images: owner delete"
    on storage.objects for delete
    using (
        bucket_id = 'product-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = 'products'
        and (storage.foldername(name))[2] = auth.uid()::text
    );

-- Users can update (replace) only their own files
create policy "product-images: owner update"
    on storage.objects for update
    using (
        bucket_id = 'product-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = 'products'
        and (storage.foldername(name))[2] = auth.uid()::text
    );
