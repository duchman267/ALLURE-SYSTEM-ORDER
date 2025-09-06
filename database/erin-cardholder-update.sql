-- Update database untuk Erin Card Holder
-- Berdasarkan gambar pricing yang diberikan

-- Update products table dengan Erin Card Holder
UPDATE products SET 
    nama_produk = 'Erin Card Holder',
    deskripsi = 'Card holder premium dengan berbagai pilihan bahan dan finishing',
    kategori = 'Accessories'
WHERE id = 1;

-- Update materials untuk Erin Card Holder
UPDATE materials SET nama_bahan = 'Prada', deskripsi = 'Material Prada premium quality' WHERE id = 1;
UPDATE materials SET nama_bahan = 'Basic', deskripsi = 'Material basic berkualitas standar' WHERE id = 2;
UPDATE materials SET nama_bahan = 'Premium', deskripsi = 'Material premium dengan finishing terbaik' WHERE id = 3;

-- Clear existing pricing untuk product id 1
DELETE FROM pricing WHERE product_id = 1;

-- Insert pricing untuk Erin Card Holder - Prada
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(1, 1, 100, 299, 7000.00),
(1, 1, 300, 499, 5750.00),
(1, 1, 500, 799, 5250.00),
(1, 1, 800, 9999, 4750.00);

-- Insert pricing untuk Erin Card Holder - Basic
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(1, 2, 100, 299, 7250.00),
(1, 2, 300, 499, 6000.00),
(1, 2, 500, 799, 5500.00),
(1, 2, 800, 9999, 5000.00);

-- Insert pricing untuk Erin Card Holder - Premium
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(1, 3, 100, 299, 8750.00),
(1, 3, 300, 499, 7250.00),
(1, 3, 500, 799, 6750.00),
(1, 3, 800, 9999, 6250.00);

-- Update upgrades berdasarkan gambar
DELETE FROM upgrades;

INSERT INTO upgrades (nama_upgrade, deskripsi, harga_upgrade, produk_terkait) VALUES
('Monogram/Logo Upgrade - Laser (2x4 Cm)', 'Laser engraving untuk monogram atau logo ukuran 2x4 cm', 2500.00, '[1]'),
('Plastik Ziplock & Sablon', 'Kemasan plastik ziplock dengan sablon', 1500.00, '[1]'),
('Thankscard (10.5x6.5 cm)', 'Kartu ucapan terima kasih ukuran 10.5x6.5 cm', 500.00, '[1]'),
('Papersleeve (Putih fullcolor)', 'Paper sleeve putih dengan printing full color', 700.00, '[1]'),
('Curved Card (min 300 Pcs)', 'Kartu dengan bentuk melengkung, minimum 300 pcs', 1500.00, '[1]'),
('Vellum Paper (Kertas transparan)', 'Kertas vellum transparan premium', 2000.00, '[1]'),
('Box Kraft & Pita/Tali Goni', 'Box kraft dengan pita atau tali goni', 2250.00, '[1]'),
('Box Kraft & Sablon (Min 200 Pcs)', 'Box kraft dengan sablon, minimum 200 pcs', 2250.00, '[1]'),
('Box Mika & Pita', 'Box mika transparan dengan pita', 2500.00, '[1]'),
('Box Mika & Soft Cover (Jasmine paper - Min 200 Pcs)', 'Box mika dengan soft cover jasmine paper, minimum 200 pcs', 3500.00, '[1]'),
('Pouch Tile', 'Pouch dengan motif tile', 1500.00, '[1]'),
('Pouch Belacu (sablon 1 warna - Min 200 Pcs)', 'Pouch belacu dengan sablon 1 warna, minimum 200 pcs', 4000.00, '[1]'),
('Pouch Spunbond (sablon 1 warna - Min 200 Pcs)', 'Pouch spunbond dengan sablon 1 warna, minimum 200 pcs', 3000.00, '[1]');

-- Update packaging untuk include yang sudah ada di upgrade
UPDATE packaging SET 
    nama_packaging = 'Termasuk: Terimakasih Card/Paper Sleeve, Packaging Plastik Standar & monogram/logo/marking dengan finishing debosse/sablon',
    deskripsi = 'Paket standar sudah termasuk kartu ucapan, kemasan plastik, dan marking dasar',
    harga_packaging = 0.00
WHERE id = 1;