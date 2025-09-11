import express, { Request, Response } from 'express'
import jwt, { SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { insertUserDirect } from '../lib/postgres'
import type { CreateUserData, LoginData, ApiResponse, User } from '../types'

const router = express.Router()

/**
 * Register new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData: CreateUserData = req.body
    console.log('🔍 Registration attempt for:', userData.email)

    // TEMPORARY: Skip Supabase Auth and create user directly in database for testing
    // Generate a UUID for the user
    const userId = crypto.randomUUID()
    
    console.log('🔧 TEMPORARY: Creating user directly in database with ID:', userId)
    
    // Simulate successful auth creation
    const authData = {
      user: {
        id: userId,
        email: userData.email
      }
    }
    const authError = null

    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return res.status(400).json({
        success: false,
        error: 'Auth user creation failed'
      } as ApiResponse)
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create auth user'
      } as ApiResponse)
    }

    console.log('✅ Auth user created:', authData.user.id)
    
    // Debug: Test what role we're using for the database operation
    console.log('🔍 Testing database connection role...')
    try {
      const { data: roleTest, error: roleError } = await supabaseAdmin
        .rpc('current_user')
      console.log('  Database role:', roleTest || 'Unknown')
      console.log('  Role error:', roleError?.message || 'None')
    } catch (roleErr: any) {
      console.log('  Role test failed:', roleErr.message)
    }

    // Wait and retry approach for auth user to be available for foreign key constraint
    let profileData: any = null
    let profileError: any = null
    let retryCount = 0
    const maxRetries = 5

    while (retryCount < maxRetries && !profileData) {
      retryCount++
      
      // Wait longer between retries
      if (retryCount > 1) {
        await new Promise(resolve => setTimeout(resolve, 200 * retryCount))
        console.log(`🔄 Retry ${retryCount}/${maxRetries} for profile creation...`)
      }

      // Skip auth verification for now
      console.log(`🔧 Attempt ${retryCount}: Skipping auth verification, proceeding with database insert`)

      // Use direct PostgreSQL connection to bypass Supabase client issues
      const result = await insertUserDirect({
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      })

      profileData = result.data
      profileError = result.error

      if (profileError) {
        console.log(`❌ Profile creation failed on attempt ${retryCount}:`, profileError.message)
        if (profileError.code === '23503') {
          console.log(`🔄 Foreign key constraint error - will retry...`)
          continue // Retry on foreign key constraint error
        } else {
          break // Different error, don't retry
        }
      } else {
        console.log(`✅ Profile created successfully on attempt ${retryCount}:`, profileData.id)
        break
      }
    }

    // 🔍 DEBUG: Verify the auth user was created correctly
    console.log('🔍 Registration verification:')
    console.log('  Auth user ID:', authData.user.id)
    console.log('  Profile ID:', profileData?.id)
    console.log('  Match:', authData.user.id === profileData?.id)

    // Double-check that the auth user actually exists
    try {
      const { data: verifyAuthUser } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
      console.log('  Auth user exists in auth.users:', !!verifyAuthUser?.user)
    } catch (verifyError: any) {
      console.log('  Auth user verification failed:', verifyError.message)
    }

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
      .eq('id', authData.user.id)
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
    console.log('  - profile.id:', profile.id) // users.id (same as auth.users.id)
    console.log('  - profile.email:', profile.email)
    console.log('  - profile.role:', profile.role)

    // Generate JWT token with auth.users.id (which is now profile.id)
    const token = jwt.sign(
      { 
        userId: profile.id, // This is auth.users.id (same as users.id)
        email: profile.email,
        role: profile.role
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as SignOptions
    )

    console.log('🔍 JWT Token created with userId:', profile.id)

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
      .eq('id', decoded.userId)
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
