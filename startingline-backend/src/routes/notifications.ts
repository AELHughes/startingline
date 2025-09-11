import express, { Request, Response } from 'express'
import { 
  createNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../lib/database'
import { authenticateToken } from '../middleware/auth-local'
import type { ApiResponse } from '../types'

const router = express.Router()

// ============================================
// NOTIFICATION ROUTES
// ============================================

// Get user notifications
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const limit = parseInt(req.query.limit as string) || 50
    
    const notifications = await getUserNotifications(userId, limit)
    
    res.json({
      success: true,
      data: notifications,
      message: 'Notifications retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get notifications error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    } as ApiResponse)
  }
})

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    
    const count = await getUnreadNotificationCount(userId)
    
    res.json({
      success: true,
      data: { count },
      message: 'Unread count retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get unread count error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve unread count'
    } as ApiResponse)
  }
})

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    
    const notification = await markNotificationAsRead(id, userId)
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Mark notification read error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    } as ApiResponse)
  }
})

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    
    const notifications = await markAllNotificationsAsRead(userId)
    
    res.json({
      success: true,
      data: notifications,
      message: 'All notifications marked as read'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Mark all notifications read error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    } as ApiResponse)
  }
})

// Create notification (admin only)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create notifications'
      } as ApiResponse)
    }
    
    const { userId, type, title, message, link, metadata } = req.body
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, type, title, message'
      } as ApiResponse)
    }
    
    const notification = await createNotification(
      userId,
      type,
      title,
      message,
      link,
      metadata
    )
    
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Create notification error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    } as ApiResponse)
  }
})

export default router
