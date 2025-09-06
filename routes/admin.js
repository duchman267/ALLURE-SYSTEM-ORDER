const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/admin/orders - List semua pesanan untuk admin
router.get('/orders', async (req, res) => {
    try {
        // Simple query without pagination for now
        const [orders] = await pool.execute(`
            SELECT 
                id,
                order_number,
                nama_pemesan,
                kontak_pemesan,
                email,
                harga_total,
                status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 20
        `);

        res.json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: 1,
                    total_pages: 1,
                    total_orders: orders.length,
                    per_page: 20
                }
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// GET /api/admin/orders/:id - Detail pesanan untuk admin
router.get('/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;

        // Get order header
        const [order] = await pool.execute(`
            SELECT * FROM orders WHERE id = ?
        `, [orderId]);

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Get order details with product info
        const [items] = await pool.execute(`
            SELECT 
                od.*,
                p.nama_produk,
                p.gambar_url as product_image,
                m.nama_bahan,
                pkg.nama_packaging,
                u.nama_upgrade,
                pd.nama_desain
            FROM order_details od
            LEFT JOIN products p ON od.product_id = p.id
            LEFT JOIN materials m ON od.material_id = m.id
            LEFT JOIN packaging pkg ON od.packaging_id = pkg.id
            LEFT JOIN upgrades u ON od.upgrade_id = u.id
            LEFT JOIN packaging_designs pd ON od.desain_packaging_id = pd.id
            WHERE od.order_id = ?
        `, [orderId]);

        res.json({
            success: true,
            data: {
                order: order[0],
                items: items
            }
        });

    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details',
            error: error.message
        });
    }
});

// PUT /api/admin/orders/:id/status - Update status pesanan
router.put('/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
            });
        }

        const [result] = await pool.execute(`
            UPDATE orders 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                order_id: orderId,
                new_status: status
            }
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
});

// GET /api/admin/dashboard - Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        // Total orders
        const [totalOrders] = await pool.execute(`
            SELECT COUNT(*) as total FROM orders
        `);

        // Orders by status
        const [ordersByStatus] = await pool.execute(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
        `);

        // Revenue statistics
        const [revenueStats] = await pool.execute(`
            SELECT 
                SUM(harga_total) as total_revenue,
                AVG(harga_total) as avg_order_value,
                COUNT(*) as total_orders
            FROM orders
            WHERE status NOT IN ('cancelled')
        `);

        // Recent orders
        const [recentOrders] = await pool.execute(`
            SELECT 
                order_number,
                nama_pemesan,
                harga_total,
                status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5
        `);

        // Popular products
        const [popularProducts] = await pool.execute(`
            SELECT 
                p.nama_produk,
                SUM(od.qty) as total_qty,
                COUNT(od.id) as order_count
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.status NOT IN ('cancelled')
            GROUP BY p.id, p.nama_produk
            ORDER BY total_qty DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                total_orders: totalOrders[0].total,
                orders_by_status: ordersByStatus,
                revenue: revenueStats[0],
                recent_orders: recentOrders,
                popular_products: popularProducts
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

module.exports = router;