import express, { Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { authenticateToken } from '../middleware/auth-local'
import type { ApiResponse } from '../types'

const router = express.Router()

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'images')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid-timestamp.extension
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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
 * Upload single image
 */
router.post('/upload', authenticateToken, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      } as ApiResponse)
    }

    // Additional validation for image type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed'
      } as ApiResponse)
    }

    // Construct public URL
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`
    const imageUrl = `${baseUrl}/api/storage/images/${req.file.filename}`

    console.log(`✅ Image uploaded: ${req.file.filename}`)

    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('❌ Image upload error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    } as ApiResponse)
  }
})

/**
 * Upload multiple images (gallery)
 */
router.post('/upload-multiple', authenticateToken, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      } as ApiResponse)
    }

    // Validate all files are images
    const invalidFiles = files.filter(file => !file.mimetype.startsWith('image/'))
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Only image files are allowed'
      } as ApiResponse)
    }

    // Process all uploaded files
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`
    const uploadedImages = files.map(file => ({
      url: `${baseUrl}/api/storage/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }))

    console.log(`✅ ${files.length} images uploaded`)

    res.json({
      success: true,
      data: {
        images: uploadedImages,
        count: files.length
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('❌ Multiple image upload error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    } as ApiResponse)
  }
})

/**
 * Serve images (public endpoint)
 */
router.get('/images/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const imagePath = path.join(UPLOADS_DIR, filename)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      } as ApiResponse)
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/*')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(imagePath)
    fileStream.pipe(res)

  } catch (error: any) {
    console.error('❌ Image serve error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to serve image'
    } as ApiResponse)
  }
})

/**
 * Delete image
 */
router.delete('/images/:filename', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const imagePath = path.join(UPLOADS_DIR, filename)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      } as ApiResponse)
    }

    // Delete the file
    fs.unlinkSync(imagePath)

    console.log(`✅ Image deleted: ${filename}`)

    res.json({
      success: true,
      message: 'Image deleted successfully'
    } as ApiResponse)

  } catch (error: any) {
    console.error('❌ Image delete error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    } as ApiResponse)
  }
})

/**
 * Get image info
 */
router.get('/info/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params
    const imagePath = path.join(UPLOADS_DIR, filename)

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      } as ApiResponse)
    }

    // Get file stats
    const stats = fs.statSync(imagePath)
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`

    res.json({
      success: true,
      data: {
        filename,
        url: `${baseUrl}/api/storage/images/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('❌ Image info error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to get image info'
    } as ApiResponse)
  }
})

export default router
