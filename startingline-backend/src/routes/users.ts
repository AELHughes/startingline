import express, { Request, Response } from 'express'
import { SupabaseService } from '../services/supabaseService'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()
const supabase = new SupabaseService()

/**
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await supabase.getUserById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user profile'
    })
  }
})

/**
 * Get current user profile (alternative endpoint)
 */
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const user = await supabase.getUserById(userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user profile'
    })
  }
})

/**
 * Update current user profile (alternative endpoint)
 */
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const updateData = req.body
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id
    delete updateData.auth_user_id
    delete updateData.role
    delete updateData.created_at
    delete updateData.updated_at
    
    const user = await supabase.updateUser(userId, updateData)

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Update user profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user profile'
    })
  }
})

/**
 * Update current user profile
 */
router.put('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId
    const updateData = req.body
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id
    delete updateData.auth_user_id
    delete updateData.role
    delete updateData.created_at
    delete updateData.updated_at
    
    const user = await supabase.updateUser(userId, updateData)

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Update user profile error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user profile'
    })
  }
})

/**
 * Get all users (Admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role, search, limit = 50, offset = 0 } = req.query
    
    // This would need to be implemented in SupabaseService
    // For now, return a basic response
    res.json({
      success: true,
      data: [],
      message: 'User listing not implemented yet'
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get users'
    })
  }
})

/**
 * Get user by ID (Admin only)
 */
router.get('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await supabase.getUserById(id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get user'
    })
  }
})

/**
 * Update user by ID (Admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    // Remove sensitive fields
    delete updateData.id
    delete updateData.auth_user_id
    delete updateData.created_at
    delete updateData.updated_at
    
    const user = await supabase.updateUser(id, updateData)

    res.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update user'
    })
  }
})

/**
 * Delete user by ID (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Don't allow deleting yourself
    if (id === req.user!.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      })
    }
    
    await supabase.deleteUser(id)

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete user'
    })
  }
})

export default router
