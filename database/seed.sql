-- Seed data for GinkoPosters
-- Password hash for "admin123" using bcrypt
INSERT INTO users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'admin@ginkoposters.com', '$2b$12$CRWX7GJvnjngUhtweramV.ozlcxf3WONOBHWpw1IeUwL/HXQsMQFm', 'admin');

-- Artists (MadeByGray only)
INSERT INTO artists (id, name, slug, domain, primary_color, secondary_color, bio, is_active) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'MadeByGray', 'madebygray', 'madebygray.local', '#2D2D2D', '#C0C0C0', 'Bold, culture-driven poster art blending fashion, music, and street aesthetics.', true);

-- Products for MadeByGray
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b3000001-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'AT Vetement', 'at-vetement', 'A striking fashion-forward poster blending haute couture with raw street energy.', '/images/madebygray/at-vetement.jpg', true),
  ('b3000002-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', 'Bape x KidSuper', 'bape-x-kidsuper', 'A bold collision of two iconic streetwear worlds — Bape meets KidSuper in vivid detail.', '/images/madebygray/bape-x-kidsuper.jpg', true),
  ('b3000003-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', 'Jordan Barrett', 'jordan-barrett', 'Supermodel Jordan Barrett captured in a moody, editorial-style poster design.', '/images/madebygray/jordan-barrett.jpg', true),
  ('b3000004-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 'Sp5der Cuntry', 'sp5der-cuntry', 'Sp5der''s signature aesthetic distilled into a bold, eye-catching poster piece.', '/images/madebygray/sp5der-cuntry.jpg', true),
  ('b3000005-0000-0000-0000-000000000005', 'a3333333-3333-3333-3333-333333333333', 'Sunburn Dominic Fike', 'sunburn-dominic-fike', 'Dominic Fike''s sun-soaked Sunburn era captured in warm tones and expressive composition.', '/images/madebygray/sunburn-dominic-fike.jpg', true),
  ('b3000006-0000-0000-0000-000000000006', 'a3333333-3333-3333-3333-333333333333', 'Travis Scott', 'travis-scott', 'The raw intensity and larger-than-life presence of Travis Scott brought to poster form.', '/images/madebygray/travis-scott.jpg', true),
  ('b3000007-0000-0000-0000-000000000007', 'a3333333-3333-3333-3333-333333333333', 'Yohji Yamamoto AW1998', 'yohji-yamamoto-aw1998', 'A tribute to Yohji Yamamoto''s legendary Autumn/Winter 1998 collection — dark, poetic, timeless.', '/images/madebygray/yohji-yamamoto-aw1998.jpg', true);

-- Variants: A4, A3, A2 for every product
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  -- AT Vetement
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A4', 'MBG-ATV-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A3', 'MBG-ATV-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A2', 'MBG-ATV-A2', 44.99, 14.00),
  -- Bape x KidSuper
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A4', 'MBG-BKS-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A3', 'MBG-BKS-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A2', 'MBG-BKS-A2', 44.99, 14.00),
  -- Jordan Barrett
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A4', 'MBG-JBT-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A3', 'MBG-JBT-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A2', 'MBG-JBT-A2', 44.99, 14.00),
  -- Sp5der Cuntry
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A4', 'MBG-SP5-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A3', 'MBG-SP5-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A2', 'MBG-SP5-A2', 44.99, 14.00),
  -- Sunburn Dominic Fike
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A4', 'MBG-SDF-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A3', 'MBG-SDF-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000005-0000-0000-0000-000000000005', 'A2', 'MBG-SDF-A2', 44.99, 14.00),
  -- Travis Scott
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A4', 'MBG-TSC-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A3', 'MBG-TSC-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000006-0000-0000-0000-000000000006', 'A2', 'MBG-TSC-A2', 44.99, 14.00),
  -- Yohji Yamamoto AW1998
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A4', 'MBG-YYA-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A3', 'MBG-YYA-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000007-0000-0000-0000-000000000007', 'A2', 'MBG-YYA-A2', 44.99, 14.00);
