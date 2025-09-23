import express, { Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { pool } from '../lib/database'
import { authenticateToken, requireOrganiser } from '../middleware/auth-local'
import type { ApiResponse } from '../types'

const router = express.Router()

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'logos')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Configure multer for organizer logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: organizer-uuid-timestamp.extension
    const uniqueName = `organizer-${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for logos
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }
})

/**
 * Upload organizer logo
 */
router.post('/organizer-logo', authenticateToken, requireOrganiser, upload.single('logo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No logo file provided'
      } as ApiResponse)
    }

    const userId = req.localUser!.userId
    const logoUrl = `/uploads/logos/${req.file.filename}`

    // Update user with organizer logo URL
    const result = await pool.query(
      'UPDATE users SET organizer_logo_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, organizer_logo_url',
      [logoUrl, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }

    res.json({
      success: true,
      data: {
        logoUrl: result.rows[0].organizer_logo_url
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('Organizer logo upload error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload organizer logo'
    } as ApiResponse)
  }
})

/**
 * Get organizer logo
 */
router.get('/organizer-logo', authenticateToken, requireOrganiser, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId

    const result = await pool.query(
      'SELECT organizer_logo_url FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }

    res.json({
      success: true,
      data: {
        logoUrl: result.rows[0].organizer_logo_url
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get organizer logo error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get organizer logo'
    } as ApiResponse)
  }
})

/**
 * Delete organizer logo
 */
router.delete('/organizer-logo', authenticateToken, requireOrganiser, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId

    // Get current logo URL
    const currentResult = await pool.query(
      'SELECT organizer_logo_url FROM users WHERE id = $1',
      [userId]
    )

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }

    const currentLogoUrl = currentResult.rows[0].organizer_logo_url

    // Delete the file if it exists
    if (currentLogoUrl) {
      const filePath = path.join(process.cwd(), currentLogoUrl)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Update user to remove logo URL
    await pool.query(
      'UPDATE users SET organizer_logo_url = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    )

    res.json({
      success: true,
      message: 'Organizer logo deleted successfully'
    } as ApiResponse)

  } catch (error: any) {
    console.error('Delete organizer logo error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete organizer logo'
    } as ApiResponse)
  }
})

export default router
