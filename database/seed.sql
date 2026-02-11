-- Seed data for GinkoPosters
-- Password hash for "admin123" using bcrypt
INSERT INTO users (id, email, password_hash, role) VALUES
  (uuid_generate_v4(), 'admin@ginkoposters.com', '$2b$12$CRWX7GJvnjngUhtweramV.ozlcxf3WONOBHWpw1IeUwL/HXQsMQFm', 'admin');

-- Artists
INSERT INTO artists (id, name, slug, domain, primary_color, secondary_color, bio, is_active) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Matthias', 'matthias', 'matthias.local', '#1A1A2E', '#E94560', 'Travel-inspired poster art capturing the energy of iconic cities around the world.', true),
  ('a2222222-2222-2222-2222-222222222222', 'Sean', 'sean', 'sean.local', '#2B4865', '#F0A500', 'Surf culture and coastal lifestyle distilled into bold, sun-drenched poster designs.', true);

-- Products for Matthias
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'New York', 'new-york', 'A vibrant poster capturing the unmistakable skyline and electric atmosphere of New York City.', '/images/matthias/new-york.avif', true),
  ('b1000002-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'Rio Brasil', 'rio-brasil', 'The warmth and rhythm of Rio de Janeiro brought to life through vivid color and bold composition.', '/images/matthias/rio-brasil.jpg', true);

-- Products for Sean
INSERT INTO products (id, artist_id, title, slug, description, image_url, is_active) VALUES
  ('b2000001-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 'Surf', 'surf', 'The pure thrill of catching a wave — a tribute to surf culture and the open ocean.', '/images/sean/surf.jpeg', true),
  ('b2000002-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', 'Surf Van', 'surf-van', 'The classic surf van on an endless coastal road — freedom, adventure, and salt air.', '/images/sean/surf-van.jpg', true);

-- Variants: A4, A3, A2 for every product
-- Matthias products
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A4', 'MAT-NY-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A3', 'MAT-NY-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000001-0000-0000-0000-000000000001', 'A2', 'MAT-NY-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A4', 'MAT-RB-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A3', 'MAT-RB-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b1000002-0000-0000-0000-000000000002', 'A2', 'MAT-RB-A2', 44.99, 14.00);

-- Sean products
INSERT INTO product_variants (id, product_id, size, sku, price, cost_price) VALUES
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A4', 'SEAN-SF-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A3', 'SEAN-SF-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000001-0000-0000-0000-000000000001', 'A2', 'SEAN-SF-A2', 44.99, 14.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A4', 'SEAN-SV-A4', 19.99, 6.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A3', 'SEAN-SV-A3', 29.99, 9.00),
  (uuid_generate_v4(), 'b2000002-0000-0000-0000-000000000002', 'A2', 'SEAN-SV-A2', 44.99, 14.00);
