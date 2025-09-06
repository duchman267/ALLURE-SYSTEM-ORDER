const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/products - Ambil semua produk dengan harga dan material
router.get('/', async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT DISTINCT 
                p.id,
                p.nama_produk,
                p.deskripsi,
                p.gambar_url,
                p.status
            FROM products p
            WHERE p.status = 'active'
            ORDER BY p.nama_produk
        `);

        // Untuk setiap produk, ambil material dan harga yang tersedia
        for (let product of products) {
            const [materials] = await pool.execute(`
                SELECT DISTINCT
                    m.id as material_id,
                    m.nama_bahan,
                    m.deskripsi as material_desc
                FROM materials m
                INNER JOIN pricing pr ON m.id = pr.material_id
                WHERE pr.product_id = ?
                ORDER BY m.nama_bahan
            `, [product.id]);

            product.materials = materials;

            // Ambil range harga untuk produk ini
            const [priceRange] = await pool.execute(`
                SELECT 
                    MIN(harga_per_pcs) as min_price,
                    MAX(harga_per_pcs) as max_price
                FROM pricing
                WHERE product_id = ?
            `, [product.id]);

            product.price_range = priceRange[0];
        }

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// GET /api/products/:id/details - Detail produk dengan semua opsi
router.get('/:id/details', async (req, res) => {
    try {
        const productId = req.params.id;

        // Ambil detail produk
        const [product] = await pool.execute(`
            SELECT * FROM products WHERE id = ? AND status = 'active'
        `, [productId]);

        if (product.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Ambil materials dan pricing
        const [materials] = await pool.execute(`
            SELECT 
                m.id as material_id,
                m.nama_bahan,
                m.deskripsi,
                GROUP_CONCAT(
                    CONCAT(pr.min_qty, '-', pr.max_qty, ':', pr.harga_per_pcs)
                    ORDER BY pr.min_qty
                ) as price_tiers
            FROM materials m
            INNER JOIN pricing pr ON m.id = pr.material_id
            WHERE pr.product_id = ?
            GROUP BY m.id, m.nama_bahan, m.deskripsi
            ORDER BY m.nama_bahan
        `, [productId]);

        // Format price tiers untuk setiap material
        materials.forEach(material => {
            const tiers = material.price_tiers.split(',').map(tier => {
                const [range, price] = tier.split(':');
                const [min_qty, max_qty] = range.split('-');
                return {
                    min_qty: parseInt(min_qty),
                    max_qty: parseInt(max_qty),
                    harga_per_pcs: parseFloat(price)
                };
            });
            material.pricing_tiers = tiers;
            delete material.price_tiers;
        });

        // Ambil upgrades yang tersedia untuk produk ini
        const [upgrades] = await pool.execute(`
            SELECT id, nama_upgrade, deskripsi, harga_upgrade
            FROM upgrades
            WHERE JSON_CONTAINS(produk_terkait, ?)
        `, [productId]);

        res.json({
            success: true,
            data: {
                product: product[0],
                materials: materials,
                upgrades: upgrades
            }
        });
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
});

// POST /api/products/calculate-price - Hitung harga real-time
router.post('/calculate-price', async (req, res) => {
    try {
        const { product_id, material_id, qty, upgrade_id, packaging_id } = req.body;

        let totalPrice = 0;
        let breakdown = {};

        // 1. Hitung harga produk berdasarkan qty
        const [pricing] = await pool.execute(`
            SELECT harga_per_pcs
            FROM pricing
            WHERE product_id = ? AND material_id = ? 
            AND ? BETWEEN min_qty AND max_qty
        `, [product_id, material_id, qty]);

        if (pricing.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Pricing not found for specified quantity'
            });
        }

        const basePrice = Number(pricing[0].harga_per_pcs);
        const productPrice = basePrice * Number(qty);
        totalPrice = Number(totalPrice) + productPrice;
        
        breakdown.product = {
            harga_per_pcs: pricing[0].harga_per_pcs,
            qty: qty,
            subtotal: productPrice
        };

        // 2. Tambah harga upgrade jika ada
        if (upgrade_id) {
            const [upgrade] = await pool.execute(`
                SELECT harga_upgrade FROM upgrades WHERE id = ?
            `, [upgrade_id]);

            if (upgrade.length > 0) {
                const upgradePrice = Number(upgrade[0].harga_upgrade) * Number(qty);
                totalPrice = Number(totalPrice) + upgradePrice;
                breakdown.upgrade = {
                    harga_per_pcs: upgrade[0].harga_upgrade,
                    qty: qty,
                    subtotal: upgradePrice
                };
            }
        }

        // 3. Tambah harga packaging jika ada
        if (packaging_id) {
            const [packaging] = await pool.execute(`
                SELECT harga_packaging FROM packaging WHERE id = ?
            `, [packaging_id]);

            if (packaging.length > 0) {
                const packagingPrice = Number(packaging[0].harga_packaging);
                totalPrice = Number(totalPrice) + packagingPrice;
                breakdown.packaging = {
                    harga: packaging[0].harga_packaging,
                    subtotal: packaging[0].harga_packaging
                };
            }
        }

        res.json({
            success: true,
            data: {
                total_price: totalPrice,
                breakdown: breakdown
            }
        });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating price',
            error: error.message
        });
    }
});

module.exports = router;