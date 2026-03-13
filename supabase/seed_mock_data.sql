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

  -- ── Insert 15 mock products ───────────────────────────────────
  insert into public.products
    (user_id, category_id, title, description, price, condition, status, image_urls)
  values

    -- 1. Tops
    (
      v_user_id,
      (select id from public.categories where slug = 'tops'),
      'Floral Vintage Blouse - Size S',
      'A delicate floral blouse from the early 2000s. Lightweight cotton, pastel pink tones with ditsy floral print. Minor fading near the collar - adds to the vintage character. Perfect for spring brunches.',
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
      'Tan Leather Satchel - Medium',
      'Genuine leather satchel in warm caramel tan. Holds a 13" laptop comfortably. Two internal zippered pockets, adjustable strap. Slight scuffs on the bottom corners. From a non-smoking home.',
      1199, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'
      ]
    ),

    -- 3. Outerwear
    (
      v_user_id,
      (select id from public.categories where slug = 'outerwear'),
      'Retro 90s Windbreaker - Unisex M',
      'Iconic 90s-style colour-block windbreaker in teal, purple and white. Lightweight nylon shell, no lining. Worn twice - pristine condition. Drawstring hood, two front pockets.',
      549, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80'
      ]
    ),

    -- 4. Accessories
    (
      v_user_id,
      (select id from public.categories where slug = 'accessories'),
      'Brass Statement Earrings - Geometric',
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
      'Block-Heel Mules - Nude, Size 7',
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
      'Midi Wrap Dress - Sage Green, Size M',
      'Classic wrap-style midi dress in sage green. 100% viscose, floaty and breathable. Adjustable tie waist. Worn three times, dry-cleaned after last use. Perfect for both casual days and special occasions.',
      699, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80'
      ]
    ),

    -- 7. Tops
    (
      v_user_id,
      (select id from public.categories where slug = 'tops'),
      'Oversized Graphic Tee - Washed Black',
      'Band-style graphic t-shirt. Oversized unisex fit (marked L, fits like an XL). Heavyweight cotton with a washed, vintage feel out of the box. Tiny pinhole near the hem but otherwise great shape.',
      299, 'fair', 'available',
      array['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80']
    ),

    -- 8. Vintage
    (
      v_user_id,
      (select id from public.categories where slug = 'vintage'),
      '1980s High-Waist Denim Skirt',
      'True vintage from the 80s. Acid wash midi skirt with a slit up the back. 100% rigid cotton denim. Waist measurement is 28 inches. In excellent vintage condition with no major flaws.',
      599, 'good', 'available',
      array['https://images.unsplash.com/photo-1583496997341-f899a25b4642?w=800&q=80']
    ),

    -- 9. Outerwear
    (
      v_user_id,
      (select id from public.categories where slug = 'outerwear'),
      'Corduroy Harrington Jacket - Brown',
      'Men''s size S, but looks great oversized on anyone. Chocolate brown wide-wale corduroy with a plaid flannel lining. Zips up perfectly. Great layering piece for autumn.',
      899, 'good', 'available',
      array['https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=800&q=80']
    ),

    -- 10. Shoes
    (
      v_user_id,
      (select id from public.categories where slug = 'shoes'),
      'Canvas High-tops - Mustard Yellow',
      'Classic high-top sneakers in a vibrant mustard yellow. Size EU 38. Worn a handful of times, soles are in great condition. Laces have been freshly washed.',
      399, 'good', 'available',
      array['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80']
    ),

    -- 11. Bags
    (
      v_user_id,
      (select id from public.categories where slug = 'bags'),
      'Beaded Evening Clutch - Pearl',
      'Stunning hand-beaded clutch purse, perfect for weddings or formal events. Faux pearl detailing all over. Scalloped edge flap. Fits a smartphone, cards, and lipstick.',
      749, 'like_new', 'available',
      array['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80']
    ),

    -- 12. Bottoms
    (
      v_user_id,
      (select id from public.categories where slug = 'bottoms'),
      'Linen Wide-Leg Trousers - Oatmeal',
      '100% linen trousers ideal for summer. High-waisted with an elasticated back band for comfort. Size M. Lovely drape and very breathable. Light creasing as is typical with linen.',
      649, 'good', 'available',
      array['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80']
    ),

    -- 13. Accessories
    (
      v_user_id,
      (select id from public.categories where slug = 'accessories'),
      'Chunky Tortoiseshell Sunglasses',
      'Retro-inspired cat-eye sunglasses with thick tortoiseshell acetate frames. Unbranded. Lenses have UV protection. Comes with a soft microfiber pouch. No scratches.',
      249, 'like_new', 'available',
      array['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80']
    ),

    -- 14. Dresses
    (
      v_user_id,
      (select id from public.categories where slug = 'dresses'),
      'Velvet Slip Dress - Midnight Blue',
      'Gorgeous plush velvet slip dress. Cowl neckline and adjustable spaghetti straps. Falls just below the knee. Size S. Luxurious feel, perfect for a winter party.',
      799, 'like_new', 'available',
      array['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80']
    ),

    -- 15. Vintage
    (
      v_user_id,
      (select id from public.categories where slug = 'vintage'),
      'Embroidered Denim Jacket',
      'True 70s vintage Levi''s jacket with custom floral embroidery on the back panel. A really unique collector''s piece. Distressed beautifully over time at the cuffs and collar. Marked men''s M.',
      1499, 'fair', 'available',
      array['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80']
    );

  raise notice 'Done! 15 products seeded under demo seller (%).', v_email;
end;
$$;
