const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, and ZIP files
    const allowedTypes = [
        'image/jpeg',
        'image/png', 
        'image/jpg',
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG), PDF files, and ZIP files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

// POST /api/upload/logo - Upload logo custom
router.post('/logo', upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading logo',
            error: error.message
        });
    }
});

// POST /api/upload/design - Upload desain packaging custom
router.post('/design', upload.single('design'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        res.json({
            success: true,
            message: 'Design uploaded successfully',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                url: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Error uploading design:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading design',
            error: error.message
        });
    }
});

// POST /api/upload/design-pack - Upload ZIP file berisi multiple designs
router.post('/design-pack', upload.single('designPack'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Check if it's a ZIP file
        if (!req.file.mimetype.includes('zip')) {
            return res.status(400).json({
                success: false,
                message: 'Only ZIP files are allowed for design packs'
            });
        }

        const zipPath = req.file.path;
        const extractPath = path.join(uploadsDir, 'extracted', Date.now().toString());
        
        // Create extraction directory
        if (!fs.existsSync(extractPath)) {
            fs.mkdirSync(extractPath, { recursive: true });
        }

        // Extract ZIP file
        try {
            const zip = new AdmZip(zipPath);
            const zipEntries = zip.getEntries();
            const extractedFiles = [];

            zipEntries.forEach((entry) => {
                if (!entry.isDirectory) {
                    const fileName = entry.entryName;
                    const fileExt = path.extname(fileName).toLowerCase();
                    
                    // Only extract image files
                    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(fileExt)) {
                        const extractedPath = path.join(extractPath, fileName);
                        
                        // Create directory if needed
                        const dir = path.dirname(extractedPath);
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        
                        // Extract file
                        fs.writeFileSync(extractedPath, entry.getData());
                        
                        extractedFiles.push({
                            originalName: fileName,
                            extractedPath: extractedPath,
                            url: `/uploads/extracted/${path.basename(extractPath)}/${fileName}`,
                            size: entry.header.size
                        });
                    }
                }
            });

            res.json({
                success: true,
                message: 'Design pack uploaded and extracted successfully',
                data: {
                    zipFile: {
                        filename: req.file.filename,
                        originalname: req.file.originalname,
                        size: req.file.size,
                        url: `/uploads/${req.file.filename}`
                    },
                    extractedFiles: extractedFiles,
                    totalExtracted: extractedFiles.length
                }
            });
        } catch (extractError) {
            console.error('Error extracting ZIP:', extractError);
            res.status(500).json({
                success: false,
                message: 'Error extracting ZIP file',
                error: extractError.message
            });
        }
    } catch (error) {
        console.error('Error uploading design pack:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading design pack',
            error: error.message
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
    }
    
    res.status(400).json({
        success: false,
        message: error.message
    });
});

module.exports = router;