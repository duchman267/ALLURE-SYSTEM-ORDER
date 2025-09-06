-- Database Schema untuk Allure Souvenir
-- Berdasarkan data dari Google Sheets

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS upgrades;
DROP TABLE IF EXISTS packaging_designs;
DROP TABLE IF EXISTS packaging;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS products;

-- Tabel Produk Utama
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_produk VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    gambar_url VARCHAR(500),
    kategori VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Bahan/Material
CREATE TABLE materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_bahan VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Harga berdasarkan Produk, Bahan, dan Quantity
CREATE TABLE pricing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    material_id INT NOT NULL,
    min_qty INT NOT NULL,
    max_qty INT NOT NULL,
    harga_per_pcs DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (material_id) REFERENCES materials(id),
    INDEX idx_product_material (product_id, material_id),
    INDEX idx_qty_range (min_qty, max_qty)
);

-- Tabel Upgrades/Add-ons
CREATE TABLE upgrades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_upgrade VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_upgrade DECIMAL(10,2) NOT NULL,
    produk_terkait JSON, -- Array of product IDs yang support upgrade ini
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Packaging
CREATE TABLE packaging (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_packaging VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga_packaging DECIMAL(10,2) NOT NULL,
    gambar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Desain Packaging yang Tersedia
CREATE TABLE packaging_designs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    packaging_id INT NOT NULL,
    nama_desain VARCHAR(255) NOT NULL,
    preview_url VARCHAR(500),
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (packaging_id) REFERENCES packaging(id)
);

-- Tabel Pesanan Masuk (Header)
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    nama_pemesan VARCHAR(255) NOT NULL,
    kontak_pemesan VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    alamat_kirim TEXT NOT NULL,
    harga_total DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Detail Transaksi (Items dalam pesanan)
CREATE TABLE order_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    material_id INT NOT NULL,
    qty INT NOT NULL,
    harga_per_pcs DECIMAL(10,2) NOT NULL,
    packaging_id INT,
    upgrade_id INT,
    teks_logo TEXT,
    logo_custom_url VARCHAR(500),
    desain_packaging_id INT,
    desain_custom_url VARCHAR(500),
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (packaging_id) REFERENCES packaging(id),
    FOREIGN KEY (upgrade_id) REFERENCES upgrades(id),
    FOREIGN KEY (desain_packaging_id) REFERENCES packaging_designs(id)
);

-- Insert Data Produk Allure Souvenir
INSERT INTO products (nama_produk, deskripsi, kategori, gambar_url) VALUES
('Tumbler Stainless', 'Tumbler stainless steel premium dengan kualitas terbaik', 'Drinkware', '/images/tumbler-stainless.jpg'),
('Tumbler Plastik', 'Tumbler plastik food grade yang aman dan ringan', 'Drinkware', '/images/tumbler-plastik.jpg'),
('Mug Keramik', 'Mug keramik premium dengan finishing glossy', 'Drinkware', '/images/mug-keramik.jpg'),
('Mug Enamel', 'Mug enamel vintage dengan daya tahan tinggi', 'Drinkware', '/images/mug-enamel.jpg'),
('Totebag Canvas', 'Totebag canvas natural dengan kualitas premium', 'Bags', '/images/totebag-canvas.jpg'),
('Totebag Blacu', 'Totebag blacu natural ramah lingkungan', 'Bags', '/images/totebag-blacu.jpg'),
('Pouch Kanvas', 'Pouch kanvas serbaguna dengan resleting', 'Bags', '/images/pouch-kanvas.jpg'),
('Notebook Custom', 'Notebook dengan cover custom sesuai keinginan', 'Stationery', '/images/notebook-custom.jpg'),
('Keychain Akrilik', 'Gantungan kunci akrilik dengan desain custom', 'Accessories', '/images/keychain-akrilik.jpg'),
('Pin Custom', 'Pin custom dengan berbagai bentuk dan ukuran', 'Accessories', '/images/pin-custom.jpg');

-- Insert Data Material
INSERT INTO materials (nama_bahan, deskripsi) VALUES
('Stainless Steel 304', 'Stainless steel food grade tahan karat dan aman'),
('Plastik PP', 'Plastik polypropylene food grade BPA free'),
('Keramik Premium', 'Keramik berkualitas tinggi dengan finishing halus'),
('Enamel', 'Material enamel tahan panas dan gores'),
('Canvas 12oz', 'Canvas cotton 12oz premium quality'),
('Blacu Natural', 'Kain blacu natural 100% cotton'),
('Kanvas Tebal', 'Kanvas tebal untuk pouch dan dompet'),
('Kertas Art Paper', 'Kertas art paper 230gsm untuk notebook'),
('Akrilik 3mm', 'Akrilik transparan tebal 3mm'),
('Metal Brass', 'Logam kuningan untuk pin berkualitas');

-- Insert Data Pricing (Berdasarkan tier quantity)
-- Tumbler Stainless
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(1, 1, 50, 99, 45000.00),
(1, 1, 100, 199, 42000.00),
(1, 1, 200, 499, 39000.00),
(1, 1, 500, 999, 36000.00),
(1, 1, 1000, 9999, 33000.00);

-- Tumbler Plastik
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(2, 2, 50, 99, 25000.00),
(2, 2, 100, 199, 23000.00),
(2, 2, 200, 499, 21000.00),
(2, 2, 500, 999, 19000.00),
(2, 2, 1000, 9999, 17000.00);

-- Mug Keramik
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(3, 3, 50, 99, 35000.00),
(3, 3, 100, 199, 32000.00),
(3, 3, 200, 499, 29000.00),
(3, 3, 500, 999, 26000.00),
(3, 3, 1000, 9999, 23000.00);

-- Mug Enamel
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(4, 4, 50, 99, 40000.00),
(4, 4, 100, 199, 37000.00),
(4, 4, 200, 499, 34000.00),
(4, 4, 500, 999, 31000.00),
(4, 4, 1000, 9999, 28000.00);

-- Totebag Canvas
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(5, 5, 50, 99, 28000.00),
(5, 5, 100, 199, 25000.00),
(5, 5, 200, 499, 22000.00),
(5, 5, 500, 999, 19000.00),
(5, 5, 1000, 9999, 16000.00);

-- Totebag Blacu
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(6, 6, 50, 99, 18000.00),
(6, 6, 100, 199, 16000.00),
(6, 6, 200, 499, 14000.00),
(6, 6, 500, 999, 12000.00),
(6, 6, 1000, 9999, 10000.00);

-- Pouch Kanvas
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(7, 7, 50, 99, 22000.00),
(7, 7, 100, 199, 20000.00),
(7, 7, 200, 499, 18000.00),
(7, 7, 500, 999, 16000.00),
(7, 7, 1000, 9999, 14000.00);

-- Notebook Custom
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(8, 8, 50, 99, 32000.00),
(8, 8, 100, 199, 29000.00),
(8, 8, 200, 499, 26000.00),
(8, 8, 500, 999, 23000.00),
(8, 8, 1000, 9999, 20000.00);

-- Keychain Akrilik
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(9, 9, 50, 99, 8000.00),
(9, 9, 100, 199, 7000.00),
(9, 9, 200, 499, 6000.00),
(9, 9, 500, 999, 5000.00),
(9, 9, 1000, 9999, 4000.00);

-- Pin Custom
INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(10, 10, 50, 99, 12000.00),
(10, 10, 100, 199, 11000.00),
(10, 10, 200, 499, 10000.00),
(10, 10, 500, 999, 9000.00),
(10, 10, 1000, 9999, 8000.00);

-- Insert Data Upgrades/Add-ons
INSERT INTO upgrades (nama_upgrade, deskripsi, harga_upgrade, produk_terkait) VALUES
('Laser Engraving', 'Ukiran laser precision pada permukaan produk', 5000.00, '[1,3,4,8,9]'),
('Emboss/Deboss', 'Timbul atau cekung pada permukaan produk', 3000.00, '[5,6,7,8]'),
('Sablon 1 Warna', 'Sablon printing dengan 1 warna', 2000.00, '[1,2,3,4,5,6,7]'),
('Sablon 2 Warna', 'Sablon printing dengan 2 warna', 3500.00, '[1,2,3,4,5,6,7]'),
('Sablon Full Color', 'Sablon printing full color/CMYK', 6000.00, '[1,2,3,4,5,6,7]'),
('Digital Print', 'Digital printing resolusi tinggi', 4000.00, '[5,6,7,8]'),
('Heat Transfer Vinyl', 'Stiker vinyl dengan heat press', 2500.00, '[5,6,7]'),
('Bordir', 'Bordir benang pada kain', 8000.00, '[5,6,7]');

-- Insert Data Packaging
INSERT INTO packaging (nama_packaging, deskripsi, harga_packaging, gambar_url) VALUES
('Polybag Bening', 'Kemasan polybag transparan standar', 500.00, '/images/polybag-bening.jpg'),
('Paper Bag Kraft', 'Paper bag kraft brown dengan handle', 2500.00, '/images/paper-bag-kraft.jpg'),
('Box Kraft Small', 'Box kraft ukuran kecil untuk aksesoris', 3000.00, '/images/box-kraft-small.jpg'),
('Box Kraft Medium', 'Box kraft ukuran sedang untuk mug/tumbler', 4500.00, '/images/box-kraft-medium.jpg'),
('Box Kraft Large', 'Box kraft ukuran besar untuk totebag', 6000.00, '/images/box-kraft-large.jpg'),
('Tube Packaging', 'Kemasan tube untuk poster/notebook', 3500.00, '/images/tube-packaging.jpg'),
('Velvet Pouch', 'Kantong beludru mewah untuk aksesoris premium', 8000.00, '/images/velvet-pouch.jpg'),
('Gift Box Premium', 'Gift box premium dengan pita', 12000.00, '/images/gift-box-premium.jpg');

-- Insert Data Packaging Designs
INSERT INTO packaging_designs (packaging_id, nama_desain, preview_url, file_url) VALUES
(2, 'Kraft Natural', '/designs/kraft-natural-preview.jpg', '/designs/kraft-natural.pdf'),
(2, 'Kraft with Logo', '/designs/kraft-logo-preview.jpg', '/designs/kraft-logo.pdf'),
(3, 'Minimalist White', '/designs/box-minimalist-preview.jpg', '/designs/box-minimalist.pdf'),
(4, 'Classic Brown', '/designs/box-classic-preview.jpg', '/designs/box-classic.pdf'),
(5, 'Eco Friendly', '/designs/box-eco-preview.jpg', '/designs/box-eco.pdf'),
(8, 'Luxury Black', '/designs/gift-luxury-preview.jpg', '/designs/gift-luxury.pdf'),
(8, 'Elegant Gold', '/designs/gift-elegant-preview.jpg', '/designs/gift-elegant.pdf');

-- Insert Sample Orders untuk Testing
INSERT INTO orders (order_number, nama_pemesan, kontak_pemesan, email, alamat_kirim, harga_total, status) VALUES
('ORD-ALLURE-001', 'Siti Nurhaliza', '081234567890', 'siti@example.com', 'Jl. Merdeka No. 123, Jakarta Pusat', 2250000.00, 'confirmed'),
('ORD-ALLURE-002', 'Budi Santoso', '081987654321', 'budi@example.com', 'Jl. Sudirman No. 456, Jakarta Selatan', 1680000.00, 'processing'),
('ORD-ALLURE-003', 'Maya Sari', '081122334455', 'maya@example.com', 'Jl. Thamrin No. 789, Jakarta Pusat', 945000.00, 'pending');

-- Insert Sample Order Details
INSERT INTO order_details (order_id, product_id, material_id, qty, harga_per_pcs, packaging_id, upgrade_id, subtotal) VALUES
(1, 1, 1, 50, 45000.00, 4, 1, 2475000.00), -- Tumbler Stainless + Box Medium + Laser
(2, 5, 5, 100, 25000.00, 2, 3, 2700000.00), -- Totebag Canvas + Paper Bag + Sablon 1 Warna
(3, 9, 9, 150, 6000.00, 3, NULL, 1350000.00); -- Keychain Akrilik + Box Small