-- Seed data for GinkoPosters
-- Password hash for "admin123" using bcrypt
INSERT INTO users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'admin@ginkoposters.com', '$2b$12$CRWX7GJvnjngUhtweramV.ozlcxf3WONOBHWpw1IeUwL/HXQsMQFm', 'admin');

-- Artists (MadeByGray only — Laz Lewis lives on prod and is added via alembic, not seeded locally)
INSERT INTO artists (id, name, slug, domain, primary_color, secondary_color, bio, is_active) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'MadeByGray', 'madebygray', 'madebygray.local', '#2D2D2D', '#C0C0C0', 'Bold, culture-driven poster art blending fashion, music, and street aesthetics.', true);

-- Products for MadeByGray
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b3000001-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'AT Vetements', 'at-vetements', 'Haute couture meets raw street energy. Inspired by Vetements'' deconstructed approach to fashion, reimagined through bold graphic design.', '/images/madebygray/at-vetement.jpg', true),
  ('b3000002-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', 'BAPE x KidSuper', 'bape-x-kidsuper', 'Two streetwear giants collide. A graphic tribute to the BAPE and KidSuper collaboration — camo patterns, painterly strokes, and pure creative chaos.', '/images/madebygray/bape-x-kidsuper.jpg', true),
  ('b3000003-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', 'Jordan Barrett', 'jordan-barrett', 'Australian supermodel Jordan Barrett in a moody, editorial-style composition. Sharp contrasts and cinematic lighting define this portrait piece.', '/images/madebygray/jordan-barrett.jpg', true),
  ('b3000004-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 'Sp5der Country', 'sp5der-country', 'Sp5der''s unmistakable web-draped aesthetic meets southern grit. Bold typography and heavy textures capture the brand''s rebellious spirit.', '/images/madebygray/sp5der-cuntry.jpg', true),
  ('b3000005-0000-0000-0000-000000000005', 'a3333333-3333-3333-3333-333333333333', 'Dominic Fike — Sunburn', 'dominic-fike-sunburn', 'Dominic Fike''s Sunburn era distilled into warm, golden tones. A hazy, sun-drenched portrait that captures the feeling of the music.', '/images/madebygray/sunburn-dominic-fike.jpg', true),
  ('b3000006-0000-0000-0000-000000000006', 'a3333333-3333-3333-3333-333333333333', 'Travis Scott', 'travis-scott', 'La Flame in his element. A high-energy poster capturing the raw intensity and larger-than-life stage presence of Travis Scott.', '/images/madebygray/travis-scott.jpg', true),
  ('b3000007-0000-0000-0000-000000000007', 'a3333333-3333-3333-3333-333333333333', 'Yohji Yamamoto AW98', 'yohji-yamamoto-aw98', 'A tribute to Yohji Yamamoto''s iconic Autumn/Winter 1998 collection. Dark, poetic, and timeless — the essence of avant-garde fashion.', '/images/madebygray/yohji-yamamoto-aw1998.jpg', true);

-- Variants: metric (A4, A3, A2) + imperial (12x18, 16x24, 20x30) for every product
-- Metric sizes ship to UK/EU, imperial sizes ship to US/CA/AU
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  -- AT Vetements (metric)
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A4', 'MBG-ATV-A4', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A3', 'MBG-ATV-A3', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A2', 'MBG-ATV-A2', 49.99, 14.00),
  -- AT Vetements (imperial)
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', '12x18', 'MBG-ATV-12x18', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', '16x24', 'MBG-ATV-16x24', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', '20x30', 'MBG-ATV-20x30', 49.99, 14.00),
  -- BAPE x KidSuper (metric)
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A4', 'MBG-BKS-A4', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A3', 'MBG-BKS-A3', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A2', 'MBG-BKS-A2', 49.99, 14.00),
  -- BAPE x KidSuper (imperial)
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', '12x18', 'MBG-BKS-12x18', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', '16x24', 'MBG-BKS-16x24', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', '20x30', 'MBG-BKS-20x30', 49.99, 14.00),
  -- Jordan Barrett (metric)
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A4', 'MBG-JBT-A4', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A3', 'MBG-JBT-A3', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A2', 'MBG-JBT-A2', 49.99, 14.00),
  -- Jordan Barrett (imperial)
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', '12x18', 'MBG-JBT-12x18', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', '16x24', 'MBG-JBT-16x24', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', '20x30', 'MBG-JBT-20x30', 49.99, 14.00),
  -- Sp5der Country (metric)
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A4', 'MBG-SP5-A4', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A3', 'MBG-SP5-A3', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A2', 'MBG-SP5-A2', 49.99, 14.00),
  -- Sp5der Country (imperial)
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', '12x18', 'MBG-SP5-12x18', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', '16x24', 'MBG-SP5-16x24', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', '20x30', 'MBG-SP5-20x30', 49.99, 14.00),
  -- Dominic Fike — Sunburn (metric)
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A4', 'MBG-SDF-A4', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A3', 'MBG-SDF-A3', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A2', 'MBG-SDF-A2', 49.99, 14.00),
  -- Dominic Fike — Sunburn (imperial)
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', '12x18', 'MBG-SDF-12x18', 24.99, 6.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', '16x24', 'MBG-SDF-16x24', 34.99, 9.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', '20x30', 'MBG-SDF-20x30', 49.99, 14.00),
  -- Travis Scott (metric)
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A4', 'MBG-TSC-A4', 29.99, 6.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A3', 'MBG-TSC-A3', 39.99, 9.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A2', 'MBG-TSC-A2', 54.99, 14.00),
  -- Travis Scott (imperial)
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', '12x18', 'MBG-TSC-12x18', 29.99, 6.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', '16x24', 'MBG-TSC-16x24', 39.99, 9.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', '20x30', 'MBG-TSC-20x30', 54.99, 14.00),
  -- Yohji Yamamoto AW98 (metric)
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A4', 'MBG-YYA-A4', 29.99, 6.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A3', 'MBG-YYA-A3', 39.99, 9.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A2', 'MBG-YYA-A2', 54.99, 14.00),
  -- Yohji Yamamoto AW98 (imperial)
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', '12x18', 'MBG-YYA-12x18', 29.99, 6.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', '16x24', 'MBG-YYA-16x24', 39.99, 9.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', '20x30', 'MBG-YYA-20x30', 54.99, 14.00);
