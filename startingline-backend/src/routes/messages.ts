import express, { Request, Response } from 'express'
import { 
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

// Create message (send message)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const senderId = req.localUser!.userId
    const { recipientId, subject, body, eventId, parentMessageId } = req.body
    
    if (!recipientId || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientId, subject, body'
      } as ApiResponse)
    }
    
    const message = await createMessage(
      eventId || null,
      senderId,
      recipientId,
      subject,
      body,
      parentMessageId
    )
    
    // Create notification for recipient
    await createNotification(
      recipientId,
      'message',
      'New Message',
      `You have received a new message: "${subject}"`,
      '/dashboard/messages',
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
