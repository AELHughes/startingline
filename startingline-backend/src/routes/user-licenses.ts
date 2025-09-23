import express, { Request, Response } from 'express'
import { pool } from '../lib/database'
import { authenticateToken } from '../middleware/auth-local'
import { ApiResponse } from '../types'

const router = express.Router()

// Sport types available for licenses
const SPORT_TYPES = [
  'Road Running',
  'Road Cycling',
  'Triathlon',
  'Mountain Biking',
  'Trail Running'
]

/**
 * Get all licenses for the authenticated user
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId

    // First get the user profile ID
    const userProfileResult = await pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId])

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    const result = await pool.query(`
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
    `, [userProfileId])

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse)
  } catch (error: any) {
    console.error('Get user licenses error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user licenses'
    } as ApiResponse)
  }
})

/**
 * Create a new license for the authenticated user
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { sport_type, license_number, license_authority, issue_date, expiry_date } = req.body

    // Validate required fields
    if (!sport_type || !license_number || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'Sport type, license number, and expiry date are required'
      } as ApiResponse)
    }

    // Validate sport type
    if (!SPORT_TYPES.includes(sport_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport type. Must be one of: ${SPORT_TYPES.join(', ')}`
      } as ApiResponse)
    }

    // First get the user profile ID
    const userProfileResult = await pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId])

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Check for duplicate license number for the same sport
    const existingLicense = await pool.query(`
      SELECT id FROM user_licenses 
      WHERE user_profile_id = $1 AND sport_type = $2 AND license_number = $3
    `, [userProfileId, sport_type, license_number])

    if (existingLicense.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'License number already exists for this sport type'
      } as ApiResponse)
    }

    const result = await pool.query(`
      INSERT INTO user_licenses (
        user_profile_id, sport_type, license_number, license_authority, 
        issue_date, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userProfileId, sport_type, license_number, license_authority || null, issue_date || null, expiry_date])

    res.status(201).json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)
  } catch (error: any) {
    console.error('Create user license error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create license'
    } as ApiResponse)
  }
})

/**
 * Update an existing license
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { id } = req.params
    const { sport_type, license_number, license_authority, issue_date, expiry_date, is_active } = req.body

    // First get the user profile ID
    const userProfileResult = await pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId])

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Check if license exists and belongs to user
    const existingLicense = await pool.query(`
      SELECT id FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId])

    if (existingLicense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      } as ApiResponse)
    }

    // Validate sport type if provided
    if (sport_type && !SPORT_TYPES.includes(sport_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport type. Must be one of: ${SPORT_TYPES.join(', ')}`
      } as ApiResponse)
    }

    const result = await pool.query(`
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
    `, [id, userProfileId, sport_type, license_number, license_authority, issue_date, expiry_date, is_active])

    res.json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)
  } catch (error: any) {
    console.error('Update user license error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update license'
    } as ApiResponse)
  }
})

/**
 * Delete a license
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { id } = req.params

    // First get the user profile ID
    const userProfileResult = await pool.query(`
      SELECT id FROM user_profiles WHERE user_id = $1
    `, [userId])

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Check if license exists and belongs to user
    const existingLicense = await pool.query(`
      SELECT id FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId])

    if (existingLicense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found'
      } as ApiResponse)
    }

    await pool.query(`
      DELETE FROM user_licenses WHERE id = $1 AND user_profile_id = $2
    `, [id, userProfileId])

    res.json({
      success: true,
      message: 'License deleted successfully'
    } as ApiResponse)
  } catch (error: any) {
    console.error('Delete user license error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete license'
    } as ApiResponse)
  }
})

/**
 * Get available sport types
 */
router.get('/sport-types', authenticateToken, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: SPORT_TYPES
    } as ApiResponse)
  } catch (error: any) {
    console.error('Get sport types error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sport types'
    } as ApiResponse)
  }
})

export default router
