-- Database Schema untuk Custom Product E-commerce

-- Tabel Produk Utama
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_produk VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    gambar_url VARCHAR(500),
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

-- Tabel Upgrades (Marking: Emboss, Laser, Sablon)
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

-- Insert Sample Data
INSERT INTO products (nama_produk, deskripsi, gambar_url) VALUES
('Tumbler Custom', 'Tumbler stainless steel dengan customization', '/images/tumbler.jpg'),
('Mug Keramik', 'Mug keramik premium untuk hadiah', '/images/mug.jpg'),
('Notebook Custom', 'Notebook dengan cover custom', '/images/notebook.jpg');

INSERT INTO materials (nama_bahan, deskripsi) VALUES
('Stainless Steel 304', 'Material premium tahan karat'),
('Keramik Premium', 'Keramik berkualitas tinggi'),
('Kulit Sintetis', 'Bahan cover notebook berkualitas'),
('Plastik Food Grade', 'Plastik aman untuk makanan');

INSERT INTO pricing (product_id, material_id, min_qty, max_qty, harga_per_pcs) VALUES
(1, 1, 1, 50, 75000.00),
(1, 1, 51, 100, 70000.00),
(1, 1, 101, 500, 65000.00),
(2, 2, 1, 25, 45000.00),
(2, 2, 26, 100, 40000.00),
(3, 3, 1, 50, 85000.00),
(3, 3, 51, 200, 80000.00);

INSERT INTO upgrades (nama_upgrade, deskripsi, harga_upgrade, produk_terkait) VALUES
('Laser Engraving', 'Ukiran laser precision', 15000.00, '[1,2,3]'),
('Emboss', 'Timbul pada permukaan', 10000.00, '[1,3]'),
('Sablon', 'Printing dengan tinta khusus', 8000.00, '[1,2]');

INSERT INTO packaging (nama_packaging, deskripsi, harga_packaging, gambar_url) VALUES
('Thanks Card', 'Kartu ucapan terima kasih', 5000.00, '/images/thankscard.jpg'),
('Paper Sleeve', 'Kemasan kertas premium', 8000.00, '/images/sleeve.jpg'),
('Gift Box', 'Box hadiah mewah', 15000.00, '/images/giftbox.jpg');

INSERT INTO packaging_designs (packaging_id, nama_desain, preview_url, file_url) VALUES
(1, 'Minimalist Design', '/designs/thanks-minimal.jpg', '/designs/thanks-minimal.pdf'),
(1, 'Floral Pattern', '/designs/thanks-floral.jpg', '/designs/thanks-floral.pdf'),
(2, 'Corporate Style', '/designs/sleeve-corporate.jpg', '/designs/sleeve-corporate.pdf'),
(3, 'Luxury Gold', '/designs/box-luxury.jpg', '/designs/box-luxury.pdf');