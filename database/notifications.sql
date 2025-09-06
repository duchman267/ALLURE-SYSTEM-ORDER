-- Additional table for notification system
-- Run this after the main schema.sql

-- Tabel Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    type ENUM('order_status', 'payment', 'shipping', 'general') DEFAULT 'order_status',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(50),
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabel untuk tracking email/SMS delivery (optional)
CREATE TABLE IF NOT EXISTS notification_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    delivery_method ENUM('email', 'sms', 'whatsapp') NOT NULL,
    delivery_status ENUM('sent', 'delivered', 'failed', 'bounced') NOT NULL,
    provider_response TEXT,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id),
    INDEX idx_delivery_status (delivery_status)
);

-- Add some sample notifications for testing (will be added after orders exist)
-- INSERT INTO notifications (order_id, type, title, message, recipient_email, status) VALUES
-- (1, 'order_status', 'Pesanan Dikonfirmasi', 'Pesanan Anda telah dikonfirmasi dan akan segera diproses.', 'customer@example.com', 'sent'),
-- (1, 'order_status', 'Pesanan Sedang Diproses', 'Pesanan Anda sedang dalam tahap produksi.', 'customer@example.com', 'pending');