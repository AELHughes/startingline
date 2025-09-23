import express, { Request, Response } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth-local'
import { emailService, EmailConfig } from '../services/emailService'
import type { ApiResponse } from '../types'

const router = express.Router()

/**
 * Get current email settings
 */
router.get('/email-settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const config = emailService.getConfig()
    
    // Don't return the password in the response
    const safeConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      from: config.from,
      replyTo: config.replyTo,
      hasPassword: !!config.auth.pass
    }

    res.json({
      success: true,
      data: safeConfig
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get email settings error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get email settings'
    } as ApiResponse)
  }
})

/**
 * Update email settings
 */
router.put('/email-settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { host, port, secure, user, pass, from, replyTo } = req.body

    // Validate required fields
    if (!host || !port || !user || !from || !replyTo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required email configuration fields'
      } as ApiResponse)
    }

    const newConfig: Partial<EmailConfig> = {
      host,
      port: parseInt(port),
      secure: Boolean(secure),
      auth: {
        user,
        pass: pass || emailService.getConfig().auth.pass // Keep existing password if not provided
      },
      from,
      replyTo
    }

    emailService.updateConfig(newConfig)

    res.json({
      success: true,
      message: 'Email settings updated successfully'
    } as ApiResponse)

  } catch (error: any) {
    console.error('Update email settings error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update email settings'
    } as ApiResponse)
  }
})

/**
 * Test email configuration
 */
router.post('/email-settings/test', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { testEmail } = req.body

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        error: 'Test email address is required'
      } as ApiResponse)
    }

    const success = await emailService.sendTestEmail(testEmail)

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      } as ApiResponse)
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      } as ApiResponse)
    }

  } catch (error: any) {
    console.error('Test email error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email'
    } as ApiResponse)
  }
})

export default router



