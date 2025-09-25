import express, { Request, Response } from 'express'
import { pool } from '../lib/database'
import { authenticateToken } from '../middleware/auth-local'
import { ApiResponse } from '../types'

const router = express.Router()

// Sport types available for licenses (normalized keys and display names)
const SPORT_TYPES = {
  'road_running': 'Road Running',
  'road_cycling': 'Road Cycling', 
  'triathlon': 'Triathlon',
  'mountain_biking': 'Mountain Biking',
  'trail_running': 'Trail Running'
} as const

export type LicenseType = keyof typeof SPORT_TYPES
export const SPORT_TYPE_VALUES = Object.keys(SPORT_TYPES) as LicenseType[]
export const SPORT_TYPE_LABELS = Object.values(SPORT_TYPES)

/**
 * Get all licenses for a specific saved participant (member)
 */
router.get('/member/:participantId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { participantId } = req.params

    // First verify the participant belongs to this user
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

    // Verify the saved participant belongs to this user
    const participantResult = await pool.query(`
      SELECT id FROM saved_participants WHERE id = $1 AND user_profile_id = $2
    `, [participantId, userProfileId])

    if (participantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    // Get licenses for this participant
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
      WHERE saved_participant_id = $1 
      ORDER BY sport_type, expiry_date DESC
    `, [participantId])

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse)
  } catch (error: any) {
    console.error('Get member licenses error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get member licenses'
    } as ApiResponse)
  }
})

/**
 * Create a new license for a saved participant (member)
 */
router.post('/member/:participantId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { participantId } = req.params
    const { sport_type, license_number, license_authority, issue_date, expiry_date } = req.body

    // Validate required fields
    if (!sport_type || !license_number || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'Sport type, license number, and expiry date are required'
      } as ApiResponse)
    }

    // Validate sport type
    if (!SPORT_TYPE_VALUES.includes(sport_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport type. Must be one of: ${SPORT_TYPE_VALUES.join(', ')}`
      } as ApiResponse)
    }

    // First verify the participant belongs to this user
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

    // Verify the saved participant belongs to this user
    const participantResult = await pool.query(`
      SELECT id FROM saved_participants WHERE id = $1 AND user_profile_id = $2
    `, [participantId, userProfileId])

    if (participantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    // Check for duplicate license number for the same sport and participant
    const existingLicense = await pool.query(`
      SELECT id FROM user_licenses 
      WHERE saved_participant_id = $1 AND sport_type = $2 AND license_number = $3
    `, [participantId, sport_type, license_number])

    if (existingLicense.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'License number already exists for this member and sport type'
      } as ApiResponse)
    }

    const result = await pool.query(`
      INSERT INTO user_licenses (
        saved_participant_id, sport_type, license_number, license_authority, 
        issue_date, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [participantId, sport_type, license_number, license_authority || null, issue_date || null, expiry_date])

    res.status(201).json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)
  } catch (error: any) {
    console.error('Create member license error:', error)
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
    if (sport_type && !SPORT_TYPE_VALUES.includes(sport_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid sport type. Must be one of: ${SPORT_TYPE_VALUES.join(', ')}`
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
router.get('/sport-types', (req: Request, res: Response) => {
  try {
    const sportTypesArray = Object.entries(SPORT_TYPES).map(([key, label]) => ({
      value: key,
      label: label
    }))
    
    res.json({
      success: true,
      data: sportTypesArray
    } as ApiResponse)
  } catch (error: any) {
    console.error('Get sport types error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sport types'
    } as ApiResponse)
  }
})

/**
 * Get valid license for a specific member and sport type
 */
router.get('/member/:participantId/valid/:sportType', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const { participantId, sportType } = req.params

    console.log('🔍 License lookup request:', { participantId, sportType, userId })

    // Validate sport type
    if (!SPORT_TYPE_VALUES.includes(sportType as LicenseType)) {
      console.log('❌ Invalid sport type:', sportType)
      return res.status(400).json({
        success: false,
        error: 'Invalid sport type'
      } as ApiResponse)
    }

    // First verify the participant belongs to this user
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

    // Verify the saved participant belongs to this user
    const participantResult = await pool.query(`
      SELECT id FROM saved_participants WHERE id = $1 AND user_profile_id = $2
    `, [participantId, userProfileId])

    if (participantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    // Get valid license for this member and sport type (not expired and active)
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
      WHERE saved_participant_id = $1 
        AND sport_type = $2 
        AND is_active = true
        AND expiry_date >= CURRENT_DATE
      ORDER BY expiry_date DESC
      LIMIT 1
    `, [participantId, sportType])

    console.log('🔍 License query result:', result.rows.length, 'licenses found')
    if (result.rows.length > 0) {
      console.log('✅ Found license:', result.rows[0])
    } else {
      console.log('❌ No valid license found for participant:', participantId, 'sport type:', sportType)
    }

    res.json({
      success: true,
      data: result.rows[0] || null
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get valid member license error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get valid license'
    } as ApiResponse)
  }
})

export default router
