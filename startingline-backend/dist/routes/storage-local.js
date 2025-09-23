"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
const UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads', 'images');
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
router.post('/upload', auth_local_1.authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                error: 'Only image files are allowed'
            });
        }
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        const imageUrl = `${baseUrl}/api/storage/images/${req.file.filename}`;
        console.log(`✅ Image uploaded: ${req.file.filename}`);
        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        console.error('❌ Image upload error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
});
router.post('/upload-multiple', auth_local_1.authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No image files provided'
            });
        }
        const invalidFiles = files.filter(file => !file.mimetype.startsWith('image/'));
        if (invalidFiles.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Only image files are allowed'
            });
        }
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        const uploadedImages = files.map(file => ({
            url: `${baseUrl}/api/storage/images/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        }));
        console.log(`✅ ${files.length} images uploaded`);
        res.json({
            success: true,
            data: {
                images: uploadedImages,
                count: files.length
            }
        });
    }
    catch (error) {
        console.error('❌ Multiple image upload error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to upload images'
        });
    }
});
router.get('/images/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path_1.default.join(UPLOADS_DIR, filename);
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        res.setHeader('Content-Type', 'image/*');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        const fileStream = fs_1.default.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('❌ Image serve error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to serve image'
        });
    }
});
router.delete('/images/:filename', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path_1.default.join(UPLOADS_DIR, filename);
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        fs_1.default.unlinkSync(imagePath);
        console.log(`✅ Image deleted: ${filename}`);
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        console.error('❌ Image delete error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image'
        });
    }
});
router.get('/info/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path_1.default.join(UPLOADS_DIR, filename);
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        const stats = fs_1.default.statSync(imagePath);
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        res.json({
            success: true,
            data: {
                filename,
                url: `${baseUrl}/api/storage/images/${filename}`,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            }
        });
    }
    catch (error) {
        console.error('❌ Image info error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get image info'
        });
    }
});
exports.default = router;
//# sourceMappingURL=storage-local.js.map