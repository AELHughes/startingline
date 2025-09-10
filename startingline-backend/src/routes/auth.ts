import express, { Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import { supabase, supabaseAdmin } from '../lib/supabase'
import type { CreateUserData, LoginData, ApiResponse, User } from '../types'

const router = express.Router()

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserData = req.body
    console.log('🔍 Registration attempt for:', userData.email)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return res.status(400).json({
        success: false,
        error: authError.message
      } as ApiResponse)
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create auth user'
      } as ApiResponse)
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create user profile in public.users table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({
        success: false,
        error: profileError.message
      } as ApiResponse)
    }

    console.log('✅ Profile created:', profileData.id)

    // Generate JWT token with auth.users.id (not public.users.id)
    const token = jwt.sign(
      { 
        userId: authData.user.id, // This is auth.users.id
        email: userData.email,
        role: userData.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: profileData.id,
          auth_user_id: authData.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        },
        token
      }
    } as ApiResponse<{ user: User; token: string }>)

  } catch (error: any) {
    console.error('❌ Registration error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    } as ApiResponse)
  }
})

/**
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body
    console.log('🔍 Login attempt for:', email)

    // Use the regular client for authentication (not admin client)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('❌ Auth login failed:', authError)
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      } as ApiResponse)
    }

    console.log('✅ Auth login successful:', authData.user.id)

    // Get user profile from public.users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile lookup failed:', profileError)
      return res.status(401).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    console.log('✅ Profile found:', profile.id)

    // Debug: Show the IDs being used for JWT creation
    console.log('🔍 JWT Token Creation Debug:')
    console.log('  - profile.id:', profile.id) // public.users.id
    console.log('  - profile.auth_user_id:', profile.auth_user_id) // auth.users.id
    console.log('  - profile.email:', profile.email)
    console.log('  - profile.role:', profile.role)

    // Generate JWT token with auth.users.id (CORRECTED)
    const token = jwt.sign(
      { 
        userId: profile.auth_user_id, // Correctly stores auth.users.id
        email: profile.email,
        role: profile.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    console.log('🔍 JWT Token created with userId (auth_user_id):', profile.auth_user_id)
    console.log('🔍 This will be used to lookup public.users.id:', profile.id)

    res.json({
      success: true,
      data: {
        user: profile,
        token
      }
    } as ApiResponse<{ user: User; token: string }>)

  } catch (error: any) {
    console.error('❌ Login error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed'
    } as ApiResponse)
  }
})

/**
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      } as ApiResponse)
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }

    res.json({
      success: true,
      data: user
    } as ApiResponse<User>)

  } catch (error: any) {
    console.error('❌ Get user error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    } as ApiResponse)
  }
})

/**
 * Logout user (client-side token invalidation)
 */
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  } as ApiResponse)
})

export default router
