const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// POST /api/orders - Buat pesanan baru
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            nama_pemesan,
            kontak_pemesan,
            email,
            alamat_kirim,
            items // Array of order items
        } = req.body;

        // Generate order number
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

        let totalHarga = 0;

        // Validasi dan hitung total harga
        for (let item of items) {
            const { product_id, material_id, qty, upgrade_id, packaging_id } = item;

            // Hitung harga produk
            const [pricing] = await connection.execute(`
                SELECT harga_per_pcs
                FROM pricing
                WHERE product_id = ? AND material_id = ? 
                AND ? BETWEEN min_qty AND max_qty
            `, [product_id, material_id, qty]);

            if (pricing.length === 0) {
                throw new Error(`Pricing not found for product ${product_id} with quantity ${qty}`);
            }

            let itemTotal = pricing[0].harga_per_pcs * qty;

            // Tambah harga upgrade
            if (upgrade_id) {
                const [upgrade] = await connection.execute(`
                    SELECT harga_upgrade FROM upgrades WHERE id = ?
                `, [upgrade_id]);

                if (upgrade.length > 0) {
                    itemTotal += upgrade[0].harga_upgrade * qty;
                }
            }

            // Tambah harga packaging
            if (packaging_id) {
                const [packaging] = await connection.execute(`
                    SELECT harga_packaging FROM packaging WHERE id = ?
                `, [packaging_id]);

                if (packaging.length > 0) {
                    itemTotal += packaging[0].harga_packaging;
                }
            }

            item.calculated_total = itemTotal;
            item.harga_per_pcs = pricing[0].harga_per_pcs;
            totalHarga += itemTotal;
        }

        // Insert order header
        const [orderResult] = await connection.execute(`
            INSERT INTO orders (
                order_number, nama_pemesan, kontak_pemesan, email, 
                alamat_kirim, harga_total, status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `, [orderNumber, nama_pemesan, kontak_pemesan, email, alamat_kirim, totalHarga]);

        const orderId = orderResult.insertId;

        // Insert order details
        for (let item of items) {
            await connection.execute(`
                INSERT INTO order_details (
                    order_id, product_id, material_id, qty, harga_per_pcs,
                    packaging_id, upgrade_id, teks_logo, logo_custom_url,
                    desain_packaging_id, desain_custom_url, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderId,
                item.product_id,
                item.material_id,
                item.qty,
                item.harga_per_pcs,
                item.packaging_id || null,
                item.upgrade_id || null,
                item.teks_logo || null,
                item.logo_custom_url || null,
                item.desain_packaging_id || null,
                item.desain_custom_url || null,
                item.calculated_total
            ]);
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Order created successfully',
            data: {
                order_id: orderId,
                order_number: orderNumber,
                total_harga: totalHarga
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// GET /api/orders/:orderNumber - Ambil detail pesanan
router.get('/:orderNumber', async (req, res) => {
    try {
        const orderNumber = req.params.orderNumber;

        // Ambil header order
        const [order] = await pool.execute(`
            SELECT * FROM orders WHERE order_number = ?
        `, [orderNumber]);

        if (order.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Ambil detail items
        const [items] = await pool.execute(`
            SELECT 
                od.*,
                p.nama_produk,
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
        `, [order[0].id]);

        res.json({
            success: true,
            data: {
                order: order[0],
                items: items
            }
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
});

module.exports = router;