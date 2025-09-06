const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Notification system for order updates
// In production, this would integrate with email service (SendGrid, etc.)

// POST /api/notifications/order-status - Send notification when order status changes
router.post('/order-status', async (req, res) => {
    try {
        const { order_id, new_status, message } = req.body;

        // Get order details
        const [order] = await pool.execute(`
            SELECT 
                order_number,
                nama_pemesan,
                email,
                kontak_pemesan,
                harga_total,
                status
            FROM orders 
            WHERE id = ?
        `, [order_id]);

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderData = order[0];

        // Create notification record
        await pool.execute(`
            INSERT INTO notifications (
                order_id, 
                type, 
                title, 
                message, 
                recipient_email, 
                status
            ) VALUES (?, 'order_status', ?, ?, ?, 'pending')
        `, [
            order_id,
            `Order ${orderData.order_number} - ${getStatusText(new_status)}`,
            message || getDefaultMessage(new_status, orderData),
            orderData.email
        ]);

        // In production, send actual email/SMS here
        const notificationContent = {
            to: orderData.email,
            subject: `Update Pesanan ${orderData.order_number}`,
            html: generateEmailTemplate(orderData, new_status, message)
        };

        console.log('📧 Notification would be sent:', notificationContent);

        res.json({
            success: true,
            message: 'Notification queued successfully',
            data: {
                order_number: orderData.order_number,
                recipient: orderData.email,
                status: new_status
            }
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending notification',
            error: error.message
        });
    }
});

// GET /api/notifications/pending - Get pending notifications
router.get('/pending', async (req, res) => {
    try {
        const [notifications] = await pool.execute(`
            SELECT 
                n.*,
                o.order_number,
                o.nama_pemesan
            FROM notifications n
            JOIN orders o ON n.order_id = o.id
            WHERE n.status = 'pending'
            ORDER BY n.created_at DESC
            LIMIT 50
        `);

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
});

// Helper functions
function getStatusText(status) {
    const texts = {
        'pending': 'Menunggu Konfirmasi',
        'confirmed': 'Dikonfirmasi',
        'processing': 'Sedang Diproses',
        'shipped': 'Dikirim',
        'delivered': 'Diterima',
        'cancelled': 'Dibatalkan'
    };
    return texts[status] || status;
}

function getDefaultMessage(status, orderData) {
    const messages = {
        'confirmed': `Terima kasih! Pesanan Anda ${orderData.order_number} telah dikonfirmasi. Tim kami akan segera memproses pesanan Anda.`,
        'processing': `Pesanan ${orderData.order_number} sedang dalam tahap produksi. Estimasi selesai 3-7 hari kerja.`,
        'shipped': `Pesanan ${orderData.order_number} telah dikirim! Anda akan menerima informasi tracking segera.`,
        'delivered': `Pesanan ${orderData.order_number} telah diterima. Terima kasih telah berbelanja dengan kami!`,
        'cancelled': `Pesanan ${orderData.order_number} telah dibatalkan. Jika ada pertanyaan, silakan hubungi customer service.`
    };
    return messages[status] || `Status pesanan ${orderData.order_number} telah diupdate menjadi ${getStatusText(status)}.`;
}

function generateEmailTemplate(orderData, status, customMessage) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Update Pesanan ${orderData.order_number}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9rem; }
            .status-badge { 
                display: inline-block; 
                padding: 8px 16px; 
                background: #28a745; 
                color: white; 
                border-radius: 20px; 
                font-weight: bold; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Custom Product Store</h1>
                <h2>Update Pesanan</h2>
            </div>
            
            <div class="content">
                <p>Halo ${orderData.nama_pemesan},</p>
                
                <div class="order-info">
                    <h3>Pesanan #${orderData.order_number}</h3>
                    <p><strong>Status:</strong> <span class="status-badge">${getStatusText(status)}</span></p>
                    <p><strong>Total:</strong> Rp ${orderData.harga_total.toLocaleString()}</p>
                </div>
                
                <p>${customMessage || getDefaultMessage(status, orderData)}</p>
                
                <p>Anda dapat melacak status pesanan kapan saja di website kami dengan memasukkan nomor pesanan.</p>
            </div>
            
            <div class="footer">
                <p>Terima kasih telah berbelanja dengan kami!</p>
                <p>Custom Product Store | Email: info@customstore.com | WhatsApp: +62 812-3456-7890</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

module.exports = router;