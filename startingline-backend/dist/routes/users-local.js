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
const database_1 = require("../lib/database");
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
const UPLOADS_DIR = path_1.default.join(process.cwd(), 'uploads', 'logos');
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `organizer-${(0, uuid_1.v4)()}-${Date.now()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
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
router.post('/organizer-logo', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No logo file provided'
            });
        }
        const userId = req.localUser.userId;
        const logoUrl = `/uploads/logos/${req.file.filename}`;
        const result = await database_1.pool.query('UPDATE users SET organizer_logo_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, organizer_logo_url', [logoUrl, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                logoUrl: result.rows[0].organizer_logo_url
            }
        });
    }
    catch (error) {
        console.error('Organizer logo upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload organizer logo'
        });
    }
});
router.get('/organizer-logo', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const result = await database_1.pool.query('SELECT organizer_logo_url FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                logoUrl: result.rows[0].organizer_logo_url
            }
        });
    }
    catch (error) {
        console.error('Get organizer logo error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get organizer logo'
        });
    }
});
router.delete('/organizer-logo', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const currentResult = await database_1.pool.query('SELECT organizer_logo_url FROM users WHERE id = $1', [userId]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const currentLogoUrl = currentResult.rows[0].organizer_logo_url;
        if (currentLogoUrl) {
            const filePath = path_1.default.join(process.cwd(), currentLogoUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        await database_1.pool.query('UPDATE users SET organizer_logo_url = NULL, updated_at = NOW() WHERE id = $1', [userId]);
        res.json({
            success: true,
            message: 'Organizer logo deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete organizer logo error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete organizer logo'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users-local.js.map