import express from 'express'
import { pool } from '../config/database'
import { authenticateToken } from '../middleware/auth'
import { ApiResponse } from '../types/api'

const router = express.Router()

// License types enum
export const LICENSE_TYPES = {
  ROAD_RUNNING: 'road_running',
  ROAD_CYCLING: 'road_cycling', 
  TRAIL_RUNNING: 'trail_running',
  MOUNTAIN_BIKING: 'mountain_biking',
  TRIATHLON: 'triathlon'
} as const

export type LicenseType = typeof LICENSE_TYPES[keyof typeof LICENSE_TYPES]

export interface MemberLicense {
  id: string
  user_profile_id: string
  license_type: LicenseType
  license_number: string
  license_year: number
  valid_from: string
  valid_until: string
  issuing_body?: string
  created_at: string
  updated_at: string
}

export interface TempLicensePurchase {
  id: string
  ticket_id: string
  license_type: LicenseType
  fee_paid: number
  valid_for_event_only: boolean
  created_at: string
}

/**
 * Get all licenses for the authenticated user
 */
router.get('/member-licenses', authenticateToken, async (req, res) => {
  try {
    const userId = req.localUser!.userId

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Get all licenses for this user
    const result = await pool.query(`
      SELECT 
        id,
        user_profile_id,
        license_type,
        license_number,
        license_year,
        valid_from,
        valid_until,
        issuing_body,
        created_at,
        updated_at
      FROM member_licenses 
      WHERE user_profile_id = $1
      ORDER BY license_type, license_year DESC
    `, [userProfileId])

    res.json({
      success: true,
      data: result.rows
    } as ApiResponse)

  } catch (error) {
    console.error('Get member licenses error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get member licenses'
    } as ApiResponse)
  }
})

/**
 * Add or update a member license
 */
router.post('/member-licenses', authenticateToken, async (req, res) => {
  try {
    const userId = req.localUser!.userId
    const {
      license_type,
      license_number,
      license_year,
      valid_from,
      valid_until,
      issuing_body
    } = req.body

    // Validate required fields
    if (!license_type || !license_number || !license_year || !valid_from || !valid_until) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse)
    }

    // Validate license type
    if (!Object.values(LICENSE_TYPES).includes(license_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      } as ApiResponse)
    }

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Insert or update license (upsert)
    const result = await pool.query(`
      INSERT INTO member_licenses (
        user_profile_id,
        license_type,
        license_number,
        license_year,
        valid_from,
        valid_until,
        issuing_body,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_profile_id, license_type, license_year)
      DO UPDATE SET
        license_number = EXCLUDED.license_number,
        valid_from = EXCLUDED.valid_from,
        valid_until = EXCLUDED.valid_until,
        issuing_body = EXCLUDED.issuing_body,
        updated_at = NOW()
      RETURNING *
    `, [
      userProfileId,
      license_type,
      license_number,
      license_year,
      valid_from,
      valid_until,
      issuing_body || null
    ])

    res.json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)

  } catch (error) {
    console.error('Add/update member license error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save member license'
    } as ApiResponse)
  }
})

/**
 * Delete a member license
 */
router.delete('/member-licenses/:licenseId', authenticateToken, async (req, res) => {
  try {
    const userId = req.localUser!.userId
    const { licenseId } = req.params

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Delete license (only if it belongs to this user)
    const result = await pool.query(`
      DELETE FROM member_licenses 
      WHERE id = $1 AND user_profile_id = $2
      RETURNING *
    `, [licenseId, userProfileId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'License not found or access denied'
      } as ApiResponse)
    }

    res.json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)

  } catch (error) {
    console.error('Delete member license error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete member license'
    } as ApiResponse)
  }
})

/**
 * Get valid license for a specific event type and current year
 */
router.get('/member-licenses/valid/:licenseType', authenticateToken, async (req, res) => {
  try {
    const userId = req.localUser!.userId
    const { licenseType } = req.params
    const currentYear = new Date().getFullYear()

    // Validate license type
    if (!Object.values(LICENSE_TYPES).includes(licenseType as LicenseType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid license type'
      } as ApiResponse)
    }

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Get valid license for this type and current year
    const result = await pool.query(`
      SELECT 
        id,
        user_profile_id,
        license_type,
        license_number,
        license_year,
        valid_from,
        valid_until,
        issuing_body,
        created_at,
        updated_at
      FROM member_licenses 
      WHERE user_profile_id = $1 
        AND license_type = $2 
        AND license_year = $3
        AND valid_from <= CURRENT_DATE 
        AND valid_until >= CURRENT_DATE
      ORDER BY updated_at DESC
      LIMIT 1
    `, [userProfileId, licenseType, currentYear])

    res.json({
      success: true,
      data: result.rows[0] || null
    } as ApiResponse)

  } catch (error) {
    console.error('Get valid license error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get valid license'
    } as ApiResponse)
  }
})

/**
 * Get license types with display names
 */
router.get('/license-types', (req, res) => {
  const licenseTypes = [
    { value: LICENSE_TYPES.ROAD_RUNNING, label: 'Road Running' },
    { value: LICENSE_TYPES.ROAD_CYCLING, label: 'Road Cycling' },
    { value: LICENSE_TYPES.TRAIL_RUNNING, label: 'Trail Running' },
    { value: LICENSE_TYPES.MOUNTAIN_BIKING, label: 'Mountain Biking' },
    { value: LICENSE_TYPES.TRIATHLON, label: 'Triathlon' }
  ]

  res.json({
    success: true,
    data: licenseTypes
  } as ApiResponse)
})

export default router

