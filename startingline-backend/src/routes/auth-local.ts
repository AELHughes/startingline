import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { 
  createUser, 
  authenticateUser, 
  getUserById, 
  getUserByEmail,
  updateUser,
  isAdminUser 
} from '../lib/database'
import type { CreateUserData, LoginData, ApiResponse, User } from '../types'

const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    error: 'Too many registration attempts, please try again later.'
  }
})

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateJWT(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.email_verified
  }
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'fallback-secret-for-development',
    { expiresIn: '7d' }
  )
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

function validateUserData(userData: CreateUserData): { isValid: boolean; message?: string } {
  if (!userData.email || !validateEmail(userData.email)) {
    return { isValid: false, message: 'Valid email address is required' }
  }
  
  if (!userData.password) {
    return { isValid: false, message: 'Password is required' }
  }
  
  const passwordValidation = validatePassword(userData.password)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }
  
  if (!userData.first_name || userData.first_name.trim().length < 2) {
    return { isValid: false, message: 'First name must be at least 2 characters long' }
  }
  
  if (!userData.last_name || userData.last_name.trim().length < 2) {
    return { isValid: false, message: 'Last name must be at least 2 characters long' }
  }
  
  if (!userData.role || !['organiser', 'admin', 'participant'].includes(userData.role)) {
    return { isValid: false, message: 'Valid role is required (organiser, admin, or participant)' }
  }
  
  return { isValid: true }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * Register new user
 */
router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const userData: CreateUserData = req.body
    console.log('🔍 Registration attempt for:', userData.email, '(Role:', userData.role, ')')

    // Validate input data
    const validation = validateUserData(userData)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      } as ApiResponse)
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists'
      } as ApiResponse)
    }

    // For admin role, verify the requester has admin privileges
    if (userData.role === 'admin') {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Admin creation requires authentication'
        } as ApiResponse)
      }

      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as any
        
        const currentUser = await getUserById(decoded.userId)
        if (!currentUser || currentUser.role !== 'admin') {
          return res.status(403).json({
            success: false,
            error: 'Only existing admins can create new admin accounts'
          } as ApiResponse)
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'Invalid authentication token'
        } as ApiResponse)
      }
    }

    // Create user
    const user = await createUser(userData)
    
    // Generate JWT token
    const token = generateJWT(user)

    console.log('✅ User registered successfully:', user.email, '(ID:', user.id, ')')

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        token
      }
    } as ApiResponse<{ user: User; token: string }>)

  } catch (error: any) {
    console.error('❌ Registration error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    } as ApiResponse)
  }
})

/**
 * Login user
 */
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body
    console.log('🔍 Login attempt for:', email)

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse)
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      } as ApiResponse)
    }

    // Authenticate user
    const user = await authenticateUser(email, password)
    
    // Generate JWT token
    const token = generateJWT(user)

    console.log('✅ User logged in successfully:', user.email, '(Role:', user.role, ')')

    res.json({
      success: true,
      data: {
        user,
        token
      }
    } as ApiResponse<{ user: User; token: string }>)

  } catch (error: any) {
    console.error('❌ Login error:', error.message)
    
    // Return generic error for security
    res.status(401).json({
      success: false,
      error: 'Invalid email or password'
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
        error: 'No authentication token provided'
      } as ApiResponse)
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as any
      
      const user = await getUserById(decoded.userId)
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        } as ApiResponse)
      }

      res.json({
        success: true,
        data: user
      } as ApiResponse<User>)

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      } as ApiResponse)
    }

  } catch (error: any) {
    console.error('❌ Get user error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    } as ApiResponse)
  }
})

/**
 * Update user profile
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      } as ApiResponse)
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as any
    
    const updates = req.body
    const allowedUpdates = [
      'first_name', 'last_name', 'email', 'phone',
      'company_name', 'company_address', 'vat_number', 'company_registration_number',
      'company_phone', 'company_email', 'bank_name', 'account_holder_name',
      'account_number', 'branch_code', 'account_type'
    ]
    const filteredUpdates: any = {}
    
    // Filter to only allowed updates
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key]
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      } as ApiResponse)
    }
    
    // Validate email if being updated
    if (filteredUpdates.email && !validateEmail(filteredUpdates.email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      } as ApiResponse)
    }
    
    const updatedUser = await updateUser(decoded.userId, filteredUpdates)
    
    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    } as ApiResponse<User>)

  } catch (error: any) {
    console.error('❌ Update profile error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    } as ApiResponse)
  }
})

/**
 * Logout user (client-side token invalidation)
 */
router.post('/logout', (req: Request, res: Response) => {
  // In a more sophisticated system, you might:
  // - Add token to a blacklist
  // - Clear server-side session
  // - Log the logout event
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  } as ApiResponse)
})

/**
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection by getting user count
    const { pool } = await import('../lib/database')
    const result = await pool.query('SELECT COUNT(*) FROM users')
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        userCount: parseInt(result.rows[0].count),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed'
    })
  }
})

export default router
