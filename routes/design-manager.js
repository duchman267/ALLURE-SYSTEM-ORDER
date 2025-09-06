const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// GET /api/design-manager/packs - List all uploaded design packs
router.get('/packs', async (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, '../uploads');
        const extractedDir = path.join(uploadsDir, 'extracted');
        
        const designPacks = [];
        
        if (fs.existsSync(extractedDir)) {
            const folders = fs.readdirSync(extractedDir);
            
            folders.forEach(folder => {
                const folderPath = path.join(extractedDir, folder);
                if (fs.statSync(folderPath).isDirectory()) {
                    const files = fs.readdirSync(folderPath);
                    const imageFiles = files.filter(file => {
                        const ext = path.extname(file).toLowerCase();
                        return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext);
                    });
                    
                    designPacks.push({
                        packId: folder,
                        packName: `Design Pack ${folder}`,
                        totalFiles: imageFiles.length,
                        files: imageFiles.map(file => ({
                            name: file,
                            url: `/uploads/extracted/${folder}/${file}`,
                            path: path.join(folderPath, file)
                        })),
                        createdAt: fs.statSync(folderPath).birthtime
                    });
                }
            });
        }
        
        res.json({
            success: true,
            data: {
                packs: designPacks,
                totalPacks: designPacks.length
            }
        });
    } catch (error) {
        console.error('Error fetching design packs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching design packs',
            error: error.message
        });
    }
});

// POST /api/design-manager/import-to-db - Import designs from pack to database
router.post('/import-to-db', async (req, res) => {
    try {
        const { packId, packagingId, designNames } = req.body;
        
        if (!packId || !packagingId) {
            return res.status(400).json({
                success: false,
                message: 'Pack ID and Packaging ID are required'
            });
        }
        
        const extractedDir = path.join(__dirname, '../uploads/extracted', packId);
        
        if (!fs.existsSync(extractedDir)) {
            return res.status(404).json({
                success: false,
                message: 'Design pack not found'
            });
        }
        
        const files = fs.readdirSync(extractedDir);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext);
        });
        
        const importedDesigns = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const designName = designNames && designNames[i] ? designNames[i] : path.parse(file).name;
            
            // Insert into packaging_designs table
            const [result] = await pool.execute(`
                INSERT INTO packaging_designs (packaging_id, nama_desain, preview_url, file_url)
                VALUES (?, ?, ?, ?)
            `, [
                packagingId,
                designName,
                `/uploads/extracted/${packId}/${file}`,
                `/uploads/extracted/${packId}/${file}`
            ]);
            
            importedDesigns.push({
                id: result.insertId,
                name: designName,
                file: file,
                url: `/uploads/extracted/${packId}/${file}`
            });
        }
        
        res.json({
            success: true,
            message: `Successfully imported ${importedDesigns.length} designs`,
            data: {
                importedDesigns: importedDesigns,
                packId: packId,
                packagingId: packagingId
            }
        });
    } catch (error) {
        console.error('Error importing designs to database:', error);
        res.status(500).json({
            success: false,
            message: 'Error importing designs to database',
            error: error.message
        });
    }
});

// DELETE /api/design-manager/pack/:packId - Delete design pack
router.delete('/pack/:packId', async (req, res) => {
    try {
        const { packId } = req.params;
        const extractedDir = path.join(__dirname, '../uploads/extracted', packId);
        
        if (fs.existsSync(extractedDir)) {
            // Remove directory and all files
            fs.rmSync(extractedDir, { recursive: true, force: true });
            
            res.json({
                success: true,
                message: 'Design pack deleted successfully',
                data: { packId: packId }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Design pack not found'
            });
        }
    } catch (error) {
        console.error('Error deleting design pack:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting design pack',
            error: error.message
        });
    }
});

module.exports = router;