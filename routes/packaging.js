const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET /api/packaging - Ambil semua packaging dengan desain
router.get('/', async (req, res) => {
    try {
        const [packaging] = await pool.execute(`
            SELECT 
                p.id,
                p.nama_packaging,
                p.deskripsi,
                p.harga_packaging,
                p.gambar_url
            FROM packaging p
            ORDER BY p.nama_packaging
        `);

        // Untuk setiap packaging, ambil desain yang tersedia
        for (let pack of packaging) {
            const [designs] = await pool.execute(`
                SELECT 
                    id as design_id,
                    nama_desain,
                    preview_url,
                    file_url
                FROM packaging_designs
                WHERE packaging_id = ?
                ORDER BY nama_desain
            `, [pack.id]);

            pack.designs = designs;
        }

        res.json({
            success: true,
            data: packaging
        });
    } catch (error) {
        console.error('Error fetching packaging:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packaging',
            error: error.message
        });
    }
});

// GET /api/packaging/:id/designs - Ambil desain untuk packaging tertentu
router.get('/:id/designs', async (req, res) => {
    try {
        const packagingId = req.params.id;

        const [designs] = await pool.execute(`
            SELECT 
                pd.id as design_id,
                pd.nama_desain,
                pd.preview_url,
                pd.file_url,
                p.nama_packaging
            FROM packaging_designs pd
            INNER JOIN packaging p ON pd.packaging_id = p.id
            WHERE pd.packaging_id = ?
            ORDER BY pd.nama_desain
        `, [packagingId]);

        res.json({
            success: true,
            data: designs
        });
    } catch (error) {
        console.error('Error fetching packaging designs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching packaging designs',
            error: error.message
        });
    }
});

module.exports = router;