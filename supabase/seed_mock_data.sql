-- ============================================================
-- Second Chances — Mock Seed Data
-- Creates a demo seller account + 6 products. Safe to re-run.
-- Run this in Supabase SQL Editor (no signup required).
-- ============================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000099';
  v_email   text := 'demo.seller@secondchances.app';
begin
  -- ── Create a mock auth user (if not already there) ──────────
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at
  )
  values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    v_email,
    crypt('Demo@1234', gen_salt('bf')),
    now(),
    '{"display_name": "Priya Menon"}'::jsonb,
    now(), now()
  )
  on conflict (id) do nothing;

  -- ── Ensure profile row exists ────────────────────────────────
  insert into public.profiles (id, display_name)
  values (v_user_id, 'Priya Menon')
  on conflict (id) do update set display_name =
    coalesce(profiles.display_name, excluded.display_name);

  -- ── Insert 6 mock products ───────────────────────────────────
  insert into public.products
    (user_id, category_id, title, description, price, condition, status, image_urls)
  values

    -- 1. Tops
    (
      v_user_id,
      (select id from public.categories where slug = 'tops'),
      'Floral Vintage Blouse — Size S',
      'A delicate floral blouse from the early 2000s. Lightweight cotton, pastel pink tones with ditsy floral print. Minor fading near the collar — adds to the vintage character. Perfect for spring brunches.',
      349, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
        'https://images.unsplash.com/photo-1551163943-3f7253a97e38?w=800&q=80'
      ]
    ),

    -- 2. Bags
    (
      v_user_id,
      (select id from public.categories where slug = 'bags'),
      'Tan Leather Satchel — Medium',
      'Genuine leather satchel in warm caramel tan. Holds a 13" laptop comfortably. Two internal zippered pockets, adjustable strap. Slight scuffs on the bottom corners. From a non-smoking home.',
      1199, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'
      ]
    ),

    -- 3. Vintage
    (
      v_user_id,
      (select id from public.categories where slug = 'vintage'),
      'Retro 90s Windbreaker — Unisex M',
      'Iconic 90s-style colour-block windbreaker in teal, purple and white. Lightweight nylon shell, no lining. Worn twice — pristine condition. Drawstring hood, two front pockets.',
      549, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80'
      ]
    ),

    -- 4. Accessories
    (
      v_user_id,
      (select id from public.categories where slug = 'accessories'),
      'Brass Statement Earrings — Geometric',
      'Hand-crafted brass geometric drop earrings. Each earring ~5 cm. Oxidised finish gives them an earthy antique look. Lightweight for their size. From a craft fair in Jaipur.',
      199, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
      ]
    ),

    -- 5. Shoes
    (
      v_user_id,
      (select id from public.categories where slug = 'shoes'),
      'Block-Heel Mules — Nude, Size 7',
      'Comfortable block-heel mules in nude/beige suede. Worn to two events. Light scuff on the right toe, barely visible. 7 cm heel height. UK size 7 / EU 40.',
      449, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
        'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=80'
      ]
    ),

    -- 6. Dresses
    (
      v_user_id,
      (select id from public.categories where slug = 'dresses'),
      'Midi Wrap Dress — Sage Green, Size M',
      'Classic wrap-style midi dress in sage green. 100% viscose, floaty and breathable. Adjustable tie waist. Worn three times, dry-cleaned after last use. Perfect for both casual days and special occasions.',
      699, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80'
      ]
    );

  raise notice 'Done! 6 products seeded under demo seller (%).', v_email;
end;
$$;
