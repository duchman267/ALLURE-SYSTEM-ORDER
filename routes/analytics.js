const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/analytics/sales - Sales analytics
router.get('/sales', async (req, res) => {
    try {
        const { period = '30', start_date, end_date } = req.query;

        let dateFilter = '';
        let params = [];

        if (start_date && end_date) {
            dateFilter = 'WHERE o.created_at BETWEEN ? AND ?';
            params = [start_date, end_date];
        } else {
            dateFilter = 'WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
            params = [parseInt(period)];
        }

        // Daily sales
        const [dailySales] = await pool.execute(`
            SELECT 
                DATE(o.created_at) as date,
                COUNT(o.id) as orders_count,
                SUM(o.harga_total) as total_revenue,
                AVG(o.harga_total) as avg_order_value
            FROM orders o
            ${dateFilter}
            AND o.status NOT IN ('cancelled')
            GROUP BY DATE(o.created_at)
            ORDER BY date DESC
        `, params);

        // Product performance
        const [productPerformance] = await pool.execute(`
            SELECT 
                p.nama_produk,
                COUNT(od.id) as orders_count,
                SUM(od.qty) as total_quantity,
                SUM(od.subtotal) as total_revenue,
                AVG(od.harga_per_pcs) as avg_price_per_pcs
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN orders o ON od.order_id = o.id
            ${dateFilter.replace('o.created_at', 'o.created_at')}
            AND o.status NOT IN ('cancelled')
            GROUP BY p.id, p.nama_produk
            ORDER BY total_revenue DESC
        `, params);

        // Material popularity
        const [materialStats] = await pool.execute(`
            SELECT 
                m.nama_bahan,
                COUNT(od.id) as orders_count,
                SUM(od.qty) as total_quantity
            FROM order_details od
            JOIN materials m ON od.material_id = m.id
            JOIN orders o ON od.order_id = o.id
            ${dateFilter.replace('o.created_at', 'o.created_at')}
            AND o.status NOT IN ('cancelled')
            GROUP BY m.id, m.nama_bahan
            ORDER BY total_quantity DESC
        `, params);

        // Upgrade usage
        const [upgradeStats] = await pool.execute(`
            SELECT 
                u.nama_upgrade,
                COUNT(od.id) as usage_count,
                SUM(u.harga_upgrade * od.qty) as total_revenue
            FROM order_details od
            JOIN upgrades u ON od.upgrade_id = u.id
            JOIN orders o ON od.order_id = o.id
            ${dateFilter.replace('o.created_at', 'o.created_at')}
            AND o.status NOT IN ('cancelled')
            GROUP BY u.id, u.nama_upgrade
            ORDER BY usage_count DESC
        `, params);

        res.json({
            success: true,
            data: {
                daily_sales: dailySales,
                product_performance: productPerformance,
                material_stats: materialStats,
                upgrade_stats: upgradeStats,
                period: period,
                date_range: { start_date, end_date }
            }
        });

    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales analytics',
            error: error.message
        });
    }
});

// GET /api/analytics/customers - Customer analytics
router.get('/customers', async (req, res) => {
    try {
        // Top customers by revenue
        const [topCustomers] = await pool.execute(`
            SELECT 
                nama_pemesan,
                email,
                COUNT(id) as total_orders,
                SUM(harga_total) as total_spent,
                AVG(harga_total) as avg_order_value,
                MAX(created_at) as last_order_date
            FROM orders
            WHERE status NOT IN ('cancelled')
            GROUP BY nama_pemesan, email
            HAVING total_orders > 1
            ORDER BY total_spent DESC
            LIMIT 20
        `);

        // New vs returning customers
        const [customerTypes] = await pool.execute(`
            SELECT 
                CASE 
                    WHEN customer_orders.order_count = 1 THEN 'New Customer'
                    ELSE 'Returning Customer'
                END as customer_type,
                COUNT(*) as count,
                SUM(o.harga_total) as total_revenue
            FROM orders o
            JOIN (
                SELECT nama_pemesan, email, COUNT(*) as order_count
                FROM orders
                WHERE status NOT IN ('cancelled')
                GROUP BY nama_pemesan, email
            ) customer_orders ON o.nama_pemesan = customer_orders.nama_pemesan 
                AND o.email = customer_orders.email
            WHERE o.status NOT IN ('cancelled')
            GROUP BY customer_type
        `);

        // Customer acquisition by month
        const [acquisitionTrend] = await pool.execute(`
            SELECT 
                DATE_FORMAT(first_order.first_order_date, '%Y-%m') as month,
                COUNT(*) as new_customers
            FROM (
                SELECT 
                    nama_pemesan,
                    email,
                    MIN(created_at) as first_order_date
                FROM orders
                WHERE status NOT IN ('cancelled')
                GROUP BY nama_pemesan, email
            ) first_order
            WHERE first_order.first_order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month DESC
        `);

        res.json({
            success: true,
            data: {
                top_customers: topCustomers,
                customer_types: customerTypes,
                acquisition_trend: acquisitionTrend
            }
        });

    } catch (error) {
        console.error('Error fetching customer analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer analytics',
            error: error.message
        });
    }
});

// GET /api/analytics/inventory - Inventory insights
router.get('/inventory', async (req, res) => {
    try {
        // Material demand forecast
        const [materialDemand] = await pool.execute(`
            SELECT 
                m.nama_bahan,
                SUM(od.qty) as total_demand_30d,
                AVG(od.qty) as avg_order_qty,
                COUNT(DISTINCT od.order_id) as order_frequency
            FROM order_details od
            JOIN materials m ON od.material_id = m.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND o.status NOT IN ('cancelled')
            GROUP BY m.id, m.nama_bahan
            ORDER BY total_demand_30d DESC
        `);

        // Product-material combinations
        const [productMaterialCombo] = await pool.execute(`
            SELECT 
                p.nama_produk,
                m.nama_bahan,
                COUNT(od.id) as combination_count,
                SUM(od.qty) as total_quantity,
                AVG(od.harga_per_pcs) as avg_price
            FROM order_details od
            JOIN products p ON od.product_id = p.id
            JOIN materials m ON od.material_id = m.id
            JOIN orders o ON od.order_id = o.id
            WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            AND o.status NOT IN ('cancelled')
            GROUP BY p.id, m.id, p.nama_produk, m.nama_bahan
            ORDER BY combination_count DESC
            LIMIT 15
        `);

        res.json({
            success: true,
            data: {
                material_demand: materialDemand,
                product_material_combinations: productMaterialCombo
            }
        });

    } catch (error) {
        console.error('Error fetching inventory analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory analytics',
            error: error.message
        });
    }
});

module.exports = router;