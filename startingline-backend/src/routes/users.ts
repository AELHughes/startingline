import express, { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'

const router = express.Router()

// Profile completion endpoint
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, phone } = req.body
    const auth_user_id = req.headers['x-user-id'] as string

    if (!auth_user_id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({
        error: 'First name and last name are required',
        code: 'MISSING_REQUIRED_FIELDS'
      })
    }

    // Update the user in our new users table
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        first_name,
        last_name,
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', auth_user_id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update user profile:', updateError)
      return res.status(500).json({ error: updateError.message })
    }

    // Also update auth.users metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      auth_user_id,
      {
        user_metadata: {
          first_name,
          last_name,
          email_verified: true,
          role: updatedUser.role
        }
      }
    )

    if (authError) {
      console.error('Failed to update auth metadata:', authError)
      // Don't fail the request for this
    }

    return res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    })
  }
})

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const auth_user_id = req.headers['x-user-id'] as string

    if (!auth_user_id) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    // Get user from our users table
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', auth_user_id)
      .single()

    if (error) {
      console.error('Failed to get user profile:', error)
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      success: true,
      user
    })

  } catch (error: any) {
    console.error('Get profile error:', error)
    return res.status(500).json({ 
      error: 'Failed to get profile',
      details: error.message 
    })
  }
})

// Email verification endpoint
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { auth_user_id } = req.body

    if (!auth_user_id) {
      return res.status(400).json({ error: 'auth_user_id is required' })
    }

    // Update verification status in our users table
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        verification_status: 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', auth_user_id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to verify user:', updateError)
      return res.status(500).json({ error: updateError.message })
    }

    // Update auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      auth_user_id,
      {
        email_confirm: true,
        user_metadata: {
          email_verified: true,
          role: user.role
        }
      }
    )

    if (authError) {
      console.error('Failed to update auth user:', authError)
      return res.status(500).json({ error: String(authError) })
    }

    return res.json({
      success: true,
      user,
      message: 'Email verified successfully'
    })

  } catch (error: any) {
    console.error('Email verification error:', error)
    return res.status(500).json({ 
      error: 'Failed to verify email',
      details: error.message 
    })
  }
})

export default router