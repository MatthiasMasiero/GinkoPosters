-- Seed data for GinkoPosters
-- Password hash for "admin123" using bcrypt
INSERT INTO users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'admin@ginkoposters.com', '$2b$12$LJ3m4ys3Lk0TSwHCbR5RyuK0bGPMHnTZEECqMYDR8OEi7NJ1ZC5S6', 'admin');

-- Artists
INSERT INTO artists (id, name, slug, domain, primary_color, secondary_color, bio, is_active) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Vizu Creative', 'vizu-creative', 'vizucreative.local', '#2D3436', '#6C5CE7', 'Bold visual storytelling through modern poster design.', true),
  ('a2222222-2222-2222-2222-222222222222', 'Jelly Designs', 'jelly-designs', 'jellydesigns.local', '#E17055', '#00B894', 'Playful and vibrant art prints for happy spaces.', true),
  ('a3333333-3333-3333-3333-333333333333', 'Nora Studio', 'nora-studio', 'norastudio.local', '#0984E3', '#FDCB6E', 'Minimalist Scandinavian-inspired poster art.', true);

-- Products for Vizu Creative
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'Urban Echoes', 'urban-echoes', 'A striking cityscape composition blending concrete textures with neon gradients.', '/images/vizu/urban-echoes.jpg', true),
  ('b1000002-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'Midnight Geometry', 'midnight-geometry', 'Geometric shapes dance across a deep indigo background in this abstract piece.', '/images/vizu/midnight-geometry.jpg', true),
  ('b1000003-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', 'Signal & Noise', 'signal-and-noise', 'Inspired by radio waves and digital artifacts, a poster for the connected age.', '/images/vizu/signal-and-noise.jpg', true),
  ('b1000004-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', 'Chrome Botanics', 'chrome-botanics', 'Metallic plant forms rendered in a futuristic palette of silver and violet.', '/images/vizu/chrome-botanics.jpg', true),
  ('b1000005-0000-0000-0000-000000000005', 'a1111111-1111-1111-1111-111111111111', 'Parallax View', 'parallax-view', 'Layered landscapes creating depth and motion through bold color blocking.', '/images/vizu/parallax-view.jpg', true);

-- Products for Jelly Designs
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b2000001-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'Tropical Daydream', 'tropical-daydream', 'Lush tropical leaves and exotic flowers in a sun-drenched color palette.', '/images/jelly/tropical-daydream.jpg', true),
  ('b2000002-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', 'Bubblegum Sunset', 'bubblegum-sunset', 'Cotton candy skies meet ocean waves in this dreamy coastal scene.', '/images/jelly/bubblegum-sunset.jpg', true),
  ('b2000003-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', 'Happy Monsters Club', 'happy-monsters-club', 'A cheerful collection of friendly monsters perfect for any kids room.', '/images/jelly/happy-monsters-club.jpg', true),
  ('b2000004-0000-0000-0000-000000000004', 'a2222222-2222-2222-2222-222222222222', 'Citrus Splash', 'citrus-splash', 'Bright oranges, lemons, and limes bursting with zesty energy.', '/images/jelly/citrus-splash.jpg', true),
  ('b2000005-0000-0000-0000-000000000005', 'a2222222-2222-2222-2222-222222222222', 'Roller Disco', 'roller-disco', 'Retro-inspired roller skating vibes with groovy typography and patterns.', '/images/jelly/roller-disco.jpg', true),
  ('b2000006-0000-0000-0000-000000000006', 'a2222222-2222-2222-2222-222222222222', 'Cosmic Jellies', 'cosmic-jellies', 'Bioluminescent jellyfish floating through a galaxy of stars and nebulae.', '/images/jelly/cosmic-jellies.jpg', true);

-- Products for Nora Studio
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b3000001-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 'Still Morning', 'still-morning', 'A serene minimalist landscape with soft earth tones and gentle curves.', '/images/nora/still-morning.jpg', true),
  ('b3000002-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', 'Line Study No. 7', 'line-study-no-7', 'Continuous line drawing exploring human form and negative space.', '/images/nora/line-study-no-7.jpg', true),
  ('b3000003-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', 'Archipelago', 'archipelago', 'Abstract islands in muted blues and warm sand tones, inspired by Nordic coastlines.', '/images/nora/archipelago.jpg', true),
  ('b3000004-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 'Quiet Geometry', 'quiet-geometry', 'Subtle geometric patterns in cream and sage, perfect for calm interiors.', '/images/nora/quiet-geometry.jpg', true);

-- Variants: A4, A3, A2 for every product
-- Vizu Creative products
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A4', 'VIZU-UE-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A3', 'VIZU-UE-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A2', 'VIZU-UE-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A4', 'VIZU-MG-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A3', 'VIZU-MG-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A2', 'VIZU-MG-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b1000003-0000-0000-0000-000000000003', 'A4', 'VIZU-SN-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000003-0000-0000-0000-000000000003', 'A3', 'VIZU-SN-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000003-0000-0000-0000-000000000003', 'A2', 'VIZU-SN-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b1000004-0000-0000-0000-000000000004', 'A4', 'VIZU-CB-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000004-0000-0000-0000-000000000004', 'A3', 'VIZU-CB-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000004-0000-0000-0000-000000000004', 'A2', 'VIZU-CB-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b1000005-0000-0000-0000-000000000005', 'A4', 'VIZU-PV-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000005-0000-0000-0000-000000000005', 'A3', 'VIZU-PV-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000005-0000-0000-0000-000000000005', 'A2', 'VIZU-PV-A2', 44.99, 14.00);

-- Jelly Designs products
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A4', 'JELLY-TD-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A3', 'JELLY-TD-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A2', 'JELLY-TD-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A4', 'JELLY-BS-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A3', 'JELLY-BS-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A2', 'JELLY-BS-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000003-0000-0000-0000-000000000003', 'A4', 'JELLY-HM-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000003-0000-0000-0000-000000000003', 'A3', 'JELLY-HM-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000003-0000-0000-0000-000000000003', 'A2', 'JELLY-HM-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000004-0000-0000-0000-000000000004', 'A4', 'JELLY-CS-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000004-0000-0000-0000-000000000004', 'A3', 'JELLY-CS-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000004-0000-0000-0000-000000000004', 'A2', 'JELLY-CS-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000005-0000-0000-0000-000000000005', 'A4', 'JELLY-RD-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000005-0000-0000-0000-000000000005', 'A3', 'JELLY-RD-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000005-0000-0000-0000-000000000005', 'A2', 'JELLY-RD-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000006-0000-0000-0000-000000000006', 'A4', 'JELLY-CJ-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000006-0000-0000-0000-000000000006', 'A3', 'JELLY-CJ-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000006-0000-0000-0000-000000000006', 'A2', 'JELLY-CJ-A2', 44.99, 14.00);

-- Nora Studio products
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A4', 'NORA-SM-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A3', 'NORA-SM-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000001-0000-0000-0000-000000000001', 'A2', 'NORA-SM-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A4', 'NORA-LS-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A3', 'NORA-LS-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000002-0000-0000-0000-000000000002', 'A2', 'NORA-LS-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A4', 'NORA-AR-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A3', 'NORA-AR-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000003-0000-0000-0000-000000000003', 'A2', 'NORA-AR-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A4', 'NORA-QG-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A3', 'NORA-QG-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b3000004-0000-0000-0000-000000000004', 'A2', 'NORA-QG-A2', 44.99, 14.00);
