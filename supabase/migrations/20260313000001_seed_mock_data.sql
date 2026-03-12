-- ============================================================
-- Second Chances — Mock Seed Data Migration
-- Inserts 6 demo products under the first auth user.
-- Skips gracefully if no users have signed up yet.
-- Run supabase/seed_mock_data.sql from SQL Editor after signup.
-- ============================================================

do $$
declare
  v_user_id uuid;
begin
  -- Pick the first real auth user
  select id into v_user_id from auth.users order by created_at limit 1;

  -- If no users yet, exit cleanly — run seed_mock_data.sql later
  if v_user_id is null then
    raise notice 'No auth users found — skipping seed. Run supabase/seed_mock_data.sql from the SQL Editor after signing up.';
    return;
  end if;

  -- Ensure a profile row exists for this user
  insert into public.profiles (id, display_name)
  values (v_user_id, 'Priya Menon')
  on conflict (id) do update set display_name =
    coalesce(profiles.display_name, excluded.display_name);

  -- Insert 6 mock products
  insert into public.products
    (user_id, category_id, title, description, price, condition, status, image_urls)
  values

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

  raise notice 'Seeded 6 mock products under user %', v_user_id;
end;
$$;
