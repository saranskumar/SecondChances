-- ============================================================
-- Second Chances — Mock Seed Data Migration
-- ============================================================

do $$
declare
  v_user1_id uuid;
  v_user2_id uuid;
begin
  -- Pick the first two real auth users
  select id into v_user1_id from auth.users order by created_at asc limit 1 offset 0;
  select id into v_user2_id from auth.users order by created_at asc limit 1 offset 1;

  -- If no users yet, exit cleanly
  if v_user1_id is null then
    raise notice 'No auth users found — skipping seed. Please sign up at least two users first.';
    return;
  end if;
  
  -- If only one user exists, fall back to using them for everything
  if v_user2_id is null then
    v_user2_id := v_user1_id;
    raise notice 'Only 1 user found. Assigning all products to them.';
  end if;

  -- Ensure profile rows exist for both
  insert into public.profiles (id, display_name) values (v_user1_id, 'Bhama')
  on conflict (id) do update set display_name = coalesce(profiles.display_name, excluded.display_name);

  if v_user1_id != v_user2_id then
    insert into public.profiles (id, display_name) values (v_user2_id, 'Priya Arun')
    on conflict (id) do update set display_name = coalesce(profiles.display_name, excluded.display_name);
  end if;

  -- Delete existing products for these users
  delete from public.products where user_id in (v_user1_id, v_user2_id);

  -- Insert 16 mock products (split between both users)
  insert into public.products
    (user_id, category_id, title, description, price, condition, status, image_urls)
  values
    -- Tops
    (
      v_user1_id,
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
      v_user2_id,
      (select id from public.categories where slug = 'tops'),
      'Oversized Graphic T-Shirt',
      'Super comfortable cotton blend graphic tee. Has a cool retro band print. Relaxed fit, fits like a men''s Large. No cracks in the print, excellent condition.',
      299, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
      ]
    ),

    -- Bottoms
    (
      v_user1_id,
      (select id from public.categories where slug = 'bottoms'),
      'High-Waisted Mom Jeans — Size 28',
      'Classic light wash denim mom jeans. High waist, tapered leg. 100% rigid cotton denim, so it has that authentic vintage feel. Great everyday staple.',
      799, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80'
      ]
    ),
    (
      v_user2_id,
      (select id from public.categories where slug = 'bottoms'),
      'Corduroy Wide-Leg Trousers',
      'Olive green corduroy pants with a relaxed wide leg fit. Super soft and warm for winter. Minor wear on the bottom hems, otherwise perfect.',
      649, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80'
      ]
    ),

    -- Dresses
    (
      v_user1_id,
      (select id from public.categories where slug = 'dresses'),
      'Midi Wrap Dress — Sage Green, Size M',
      'Classic wrap-style midi dress in sage green. 100% viscose, floaty and breathable. Adjustable tie waist. Worn three times, dry-cleaned after last use. Perfect for both casual days and special occasions.',
      699, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80'
      ]
    ),
    (
      v_user2_id,
      (select id from public.categories where slug = 'dresses'),
      'Satin Slip Dress — Navy Blue',
      'Elegant midi-length slip dress in a deep navy color. Cowl neck detail, adjustable spaghetti straps. Worn once as a bridesmaid. Absolutely flawless condition.',
      899, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1566206091558-f529e4d56d11?w=800&q=80'
      ]
    ),

    -- Outerwear
    (
      v_user1_id,
      (select id from public.categories where slug = 'outerwear'),
      'Classic Levi''s Denim Jacket',
      'Timeless medium-wash denim jacket. Slightly oversized fit. Perfectly broken in, giving it a soft and comfortable feel. A wardrobe essential.',
      1299, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1576878938171-8bc602b9f6ee?w=800&q=80'
      ]
    ),
    (
      v_user2_id,
      (select id from public.categories where slug = 'outerwear'),
      'Faux Leather Moto Jacket',
      'Edgy black faux leather biker jacket with silver hardware. Asymmetrical zip, zippered back sleeves. Very minor peeling on the inside collar, very unnoticeable when worn.',
      1499, 'fair', 'available',
      array[
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'
      ]
    ),

    -- Accessories
    (
      v_user1_id,
      (select id from public.categories where slug = 'accessories'),
      'Brass Statement Earrings — Geometric',
      'Hand-crafted brass geometric drop earrings. Each earring ~5 cm. Oxidised finish gives them an earthy antique look. Lightweight for their size. From a craft fair in Jaipur.',
      199, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
      ]
    ),
    (
      v_user2_id,
      (select id from public.categories where slug = 'accessories'),
      'Oversized Tortoiseshell Sunglasses',
      'Chic oversized square sunglasses with tortoiseshell frames and gradient brown lenses. No scratches on the lenses. Comes with a soft pouch.',
      249, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'
      ]
    ),

    -- Shoes
    (
      v_user1_id,
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
      v_user2_id,
      (select id from public.categories where slug = 'shoes'),
      'Classic White Sneakers — Size UK 8',
      'Minimalist white faux leather sneakers. Great condition, soles have minimal wear. Laces are freshly washed. Super versatile pair for everyday wear.',
      599, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
      ]
    ),

    -- Bags
    (
      v_user1_id,
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
      v_user2_id,
      (select id from public.categories where slug = 'bags'),
      'Woven Rattan Crossbody Bag',
      'Perfect summer bag! Handwoven round rattan bag with a genuine leather strap and batik print lining. Barely used, looks brand new.',
      749, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800&q=80'
      ]
    ),

    -- Vintage
    (
      v_user1_id,
      (select id from public.categories where slug = 'vintage'),
      'Retro 90s Windbreaker — Unisex M',
      'Iconic 90s-style colour-block windbreaker in teal, purple and white. Lightweight nylon shell, no lining. Worn twice — pristine condition. Drawstring hood, two front pockets.',
      549, 'like_new', 'available',
      array[
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80'
      ]
    ),
    (
      v_user2_id,
      (select id from public.categories where slug = 'vintage'),
      '80s Silk Patterned Scarf',
      'Genuine vintage 100% silk scarf from the 1980s. Bold abstract geometric print in mustard yellow, navy, and red. Can be worn as a necktie, headband, or bag accessory. Hand-rolled edges.',
      349, 'good', 'available',
      array[
        'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=800&q=80'
      ]
    );

  raise notice 'Seeded 16 mock products under two users (%, %)', v_user1_id, v_user2_id;
end;
$$;
