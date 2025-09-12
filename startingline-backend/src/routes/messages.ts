import express, { Request, Response } from 'express'
import { 
  pool,
  createMessage,
  getUserMessages,
  getMessageThread,
  markMessageAsRead,
  getUnreadMessageCount,
  createNotification
} from '../lib/database'
import { authenticateToken } from '../middleware/auth-local'
import type { ApiResponse } from '../types'

const router = express.Router()

// ============================================
// MESSAGE ROUTES
// ============================================

// Get user messages
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const limit = parseInt(req.query.limit as string) || 50
    
    const messages = await getUserMessages(userId, limit)
    
    res.json({
      success: true,
      data: messages,
      message: 'Messages retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get messages error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages'
    } as ApiResponse)
  }
})

// Get unread message count
router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    
    const count = await getUnreadMessageCount(userId)
    
    res.json({
      success: true,
      data: { count },
      message: 'Unread count retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get unread message count error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unread message count'
    } as ApiResponse)
  }
})

// Get message thread
router.get('/:id/thread', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    
    const thread = await getMessageThread(id, userId)
    
    if (thread.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Message thread not found'
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      data: thread,
      message: 'Message thread retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get message thread error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve message thread'
    } as ApiResponse)
  }
})

// Get admin user ID (for organisers to send messages to admin)
router.get('/admin-id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { pool } = await import('../lib/database')
    
    // Get the admin user ID
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name 
      FROM users u 
      INNER JOIN admin_users au ON u.email = au.email 
      WHERE au.is_active = true 
      LIMIT 1
    `)
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active admin found'
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Admin user retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get admin user error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin user'
    } as ApiResponse)
  }
})

// Create message (send message)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const senderId = req.localUser!.userId
    const senderRole = req.localUser!.role
    const { recipientId, subject, body, eventId, parentMessageId } = req.body
    
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, body'
      } as ApiResponse)
    }
    
    let finalRecipientId = recipientId
    
    // If sender is organiser and no recipient specified, send to admin
    if (senderRole === 'organiser' && !recipientId) {
      const { pool } = await import('../lib/database')
      const adminResult = await pool.query(`
        SELECT u.id 
        FROM users u 
        INNER JOIN admin_users au ON u.email = au.email 
        WHERE au.is_active = true 
        LIMIT 1
      `)
      
      if (adminResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No active admin found to receive message'
        } as ApiResponse)
      }
      
      finalRecipientId = adminResult.rows[0].id
    } else if (!recipientId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: recipientId'
      } as ApiResponse)
    }
    
    const message = await createMessage(
      eventId || null,
      senderId,
      finalRecipientId,
      subject,
      body,
      parentMessageId
    )
    
    // Get recipient's role to determine correct link
    const recipientResult = await pool.query('SELECT role FROM users WHERE id = $1', [finalRecipientId])
    const recipientRole = recipientResult.rows[0]?.role || 'organiser'
    const messageLink = recipientRole === 'admin' ? '/admin/messages' : '/dashboard/messages'
    
    // Create notification for recipient
    await createNotification(
      finalRecipientId,
      'message',
      'New Message',
      `You have received a new message: "${subject}"`,
      messageLink,
      { messageId: message.id }
    )
    
    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Create message error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    } as ApiResponse)
  }
})

// Mark message as read
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    
    const message = await markMessageAsRead(id, userId)
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you are not the recipient'
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      data: message,
      message: 'Message marked as read'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Mark message read error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to mark message as read'
    } as ApiResponse)
  }
})

export default router
