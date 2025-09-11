import express, { Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { supabaseAdmin } from '../lib/supabase'
import { authenticateToken } from '../middleware/auth'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
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
 * Upload image to Supabase Storage
 */
router.post('/upload', authenticateToken, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      })
    }

    const { folder = 'general' } = req.body
    console.log('📁 Uploading to', folder)

    // Generate unique filename
    const fileExtension = req.file.originalname.split('.').pop()
    const fileName = `${folder}-${new Date().toISOString().replace(/[:.]/g, '')}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    console.log('📁 File path:', filePath)
    console.log('📁 File size:', req.file.size)
    console.log('📁 File type:', req.file.mimetype)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('event-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      return res.status(500).json({
        success: false,
        error: `Upload failed: ${error.message}`
      })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('event-images')
      .getPublicUrl(filePath)

    console.log('✅ Image uploaded successfully:', urlData.publicUrl)

    res.json({
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath,
        url: urlData.publicUrl
      }
    })

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    })
  }
})

/**
 * Upload multiple images
 */
router.post('/upload-multiple', authenticateToken, upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      })
    }

    const { folder = 'general' } = req.body
    const uploadResults = []

    for (const file of files) {
      try {
        // Generate unique filename
        const fileExtension = file.originalname.split('.').pop()
        const fileName = `${folder}-${new Date().toISOString().replace(/[:.]/g, '')}-${uuidv4()}.${fileExtension}`
        const filePath = `${folder}/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('event-images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          })

        if (error) {
          console.error('❌ Storage upload error for file:', file.originalname, error)
          uploadResults.push({
            originalName: file.originalname,
            success: false,
            error: error.message
          })
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('event-images')
          .getPublicUrl(filePath)

        uploadResults.push({
          originalName: file.originalname,
          success: true,
          path: data.path,
          url: urlData.publicUrl
        })

      } catch (fileError: any) {
        uploadResults.push({
          originalName: file.originalname,
          success: false,
          error: fileError.message
        })
      }
    }

    const successCount = uploadResults.filter(r => r.success).length
    const failureCount = uploadResults.filter(r => !r.success).length

    res.json({
      success: failureCount === 0,
      message: `Uploaded ${successCount}/${files.length} files successfully`,
      results: uploadResults
    })

  } catch (error: any) {
    console.error('❌ Multiple upload error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    })
  }
})

/**
 * Delete image from storage
 */
router.delete('/delete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { path } = req.body

    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      })
    }

    const { error } = await supabaseAdmin.storage
      .from('event-images')
      .remove([path])

    if (error) {
      console.error('❌ Storage delete error:', error)
      return res.status(500).json({
        success: false,
        error: `Delete failed: ${error.message}`
      })
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error: any) {
    console.error('❌ Delete error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Delete failed'
    })
  }
})

export default router
