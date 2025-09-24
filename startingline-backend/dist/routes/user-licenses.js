"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../lib/database");
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
const SPORT_TYPES = [
    'Road Running',
    'Road Cycling',
    'Triathlon',
    'Mountain Biking',
    'Trail Running'
];
router.get('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const userProfileResult = await database_1.pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId]);
        if (userProfileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userProfileId = userProfileResult.rows[0].id;
        const result = await database_1.pool.query(`
      SELECT 
        id,
        sport_type,
        license_number,
        license_authority,
        issue_date,
        expiry_date,
        is_active,
        created_at,
        updated_at
      FROM user_licenses 
      WHERE user_profile_id = $1 
      ORDER BY sport_type, expiry_date DESC
    `, [userProfileId]);
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('Get user licenses error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user licenses'
        });
    }
});
router.post('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const { sport_type, license_number, license_authority, issue_date, expiry_date } = req.body;
        if (!sport_type || !license_number || !expiry_date) {
            return res.status(400).json({
                success: false,
                error: 'Sport type, license number, and expiry date are required'
            });
        }
        if (!SPORT_TYPES.includes(sport_type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid sport type. Must be one of: ${SPORT_TYPES.join(', ')}`
            });
        }
        const userProfileResult = await database_1.pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId]);
        if (userProfileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userProfileId = userProfileResult.rows[0].id;
        const existingLicense = await database_1.pool.query(`
      SELECT id FROM user_licenses 
      WHERE user_profile_id = $1 AND sport_type = $2 AND license_number = $3
    `, [userProfileId, sport_type, license_number]);
        if (existingLicense.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'License number already exists for this sport type'
            });
        }
        const result = await database_1.pool.query(`
      INSERT INTO user_licenses (
        user_profile_id, sport_type, license_number, license_authority, 
        issue_date, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userProfileId, sport_type, license_number, license_authority || null, issue_date || null, expiry_date]);
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Create user license error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create license'
        });
    }
});
router.put('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const { id } = req.params;
        const { sport_type, license_number, license_authority, issue_date, expiry_date, is_active } = req.body;
        const userProfileResult = await database_1.pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId]);
        if (userProfileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userProfileId = userProfileResult.rows[0].id;
        const existingLicense = await database_1.pool.query(`
      SELECT id FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId]);
        if (existingLicense.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'License not found'
            });
        }
        if (sport_type && !SPORT_TYPES.includes(sport_type)) {
            return res.status(400).json({
                success: false,
                error: `Invalid sport type. Must be one of: ${SPORT_TYPES.join(', ')}`
            });
        }
        const result = await database_1.pool.query(`
      UPDATE user_licenses SET
        sport_type = COALESCE($3, sport_type),
        license_number = COALESCE($4, license_number),
        license_authority = COALESCE($5, license_authority),
        issue_date = COALESCE($6, issue_date),
        expiry_date = COALESCE($7, expiry_date),
        is_active = COALESCE($8, is_active),
        updated_at = NOW()
      WHERE id = $1 AND user_profile_id = $2
      RETURNING *
    `, [id, userProfileId, sport_type, license_number, license_authority, issue_date, expiry_date, is_active]);
        res.json({
            success: true,
            data: result.rows[0]
        });
    }
    catch (error) {
        console.error('Update user license error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update license'
        });
    }
});
router.delete('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const { id } = req.params;
        const userProfileResult = await database_1.pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId]);
        if (userProfileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userProfileId = userProfileResult.rows[0].id;
        const existingLicense = await database_1.pool.query(`
      SELECT id FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId]);
        if (existingLicense.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'License not found'
            });
        }
        await database_1.pool.query(`
      DELETE FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId]);
        res.json({
            success: true,
            message: 'License deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user license error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete license'
        });
    }
});
router.get('/sport-types', auth_local_1.authenticateToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: SPORT_TYPES
        });
    }
    catch (error) {
        console.error('Get sport types error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get sport types'
        });
    }
});
exports.default = router;
//# sourceMappingURL=user-licenses.js.map