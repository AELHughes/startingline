import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getUserById } from '../lib/database'
import type { JwtPayload } from '../types'

// Local auth user interface (different from old Supabase auth)
export interface LocalAuthUser {
  userId: string
  email: string
  role: string
  emailVerified: boolean
}

// Extend Request type to include user (avoiding conflict with old auth)
declare module 'express-serve-static-core' {
  interface Request {
    localUser?: LocalAuthUser
  }
}

/**
 * Middleware to authenticate JWT token and populate req.user
 * Uses local PostgreSQL database instead of Supabase
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔍 authenticateToken middleware called')
    const authHeader = req.headers.authorization
    console.log('🔍 authHeader:', authHeader ? 'present' : 'missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    console.log('🔍 Auth middleware - verifying token:', token.substring(0, 50) + '...')
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as JwtPayload
      console.log('🔍 Auth middleware - token decoded successfully:', decoded)
    } catch (jwtError: any) {
      console.log('❌ Auth middleware - token verification failed:', jwtError.message)
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      })
    }
    
    // Get user from database
    console.log('🔍 Auth middleware - looking up user with ID:', decoded.userId)
    const user = await getUserById(decoded.userId)
    console.log('🔍 Auth middleware - user lookup result:', user ? { id: user.id, email: user.email, role: user.role } : 'null')

    if (!user) {
      console.log('❌ Auth middleware - user not found for ID:', decoded.userId)
      return res.status(401).json({
        success: false,
        error: 'User not found'
      })
    }

    // Populate req.localUser
    req.localUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified || false
    }

    console.log(`🔐 Authenticated user: ${user.email} (${user.role})`)
    next()
    
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error.message)
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    })
  }
}

/**
 * Middleware to optionally authenticate token (for public endpoints that can benefit from auth)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next() // Continue without authentication
    }

    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-development') as JwtPayload
      
      // Get user from database
      const user = await getUserById(decoded.userId)

      if (user) {
        req.localUser = {
          userId: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified || false
        }
        console.log(`🔐 Optional auth - user authenticated: ${user.email} (${user.role})`)
      }
    } catch (jwtError) {
      // Ignore JWT errors for optional auth
      console.log('🔐 Optional auth - invalid token, continuing without auth')
    }

    next()
    
  } catch (error: any) {
    // Ignore auth errors for optional auth
    console.log('🔐 Optional auth - error occurred, continuing without auth:', error.message)
    next()
  }
}

/**
 * Middleware to require specific role(s)
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 requireRole middleware called with roles:', roles)
    console.log('🔍 req.localUser:', req.localUser)
    
    if (!req.localUser) {
      console.log('❌ requireRole: No localUser found')
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    console.log('🔍 requireRole: allowedRoles:', allowedRoles)
    console.log('🔍 requireRole: user role:', req.localUser.role)
    
    if (!allowedRoles.includes(req.localUser.role)) {
      console.log(`❌ Access denied: User ${req.localUser.email} (${req.localUser.role}) attempted to access ${allowedRoles.join('/')} endpoint`)
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      })
    }

    console.log(`✅ Access granted: User ${req.localUser.email} (${req.localUser.role}) accessing ${allowedRoles.join('/')} endpoint`)
    next()
  }
}

/**
 * Middleware to require organiser role
 */
export const requireOrganiser = requireRole('organiser')

/**
 * Middleware to require admin role
 */
export const requireAdmin = requireRole('admin')

/**
 * Middleware to require organiser or admin role
 */
export const requireOrganiserOrAdmin = requireRole(['organiser', 'admin'])

/**
 * Middleware to require participant role
 */
export const requireParticipant = requireRole('participant')

/**
 * Middleware to require email verification
 */
export const requireEmailVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.localUser) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  if (!req.localUser.emailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required. Please verify your email address to continue.'
    })
  }

  next()
}

/**
 * Middleware to check if user owns a resource
 * Use with route parameters like /events/:id where user should own the event
 */
export const requireOwnership = (resourceType: 'event' | 'ticket' | 'payment') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.localUser) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Admin users can access all resources
    if (req.localUser.role === 'admin') {
      return next()
    }

    try {
      const resourceId = req.params.id
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'Resource ID required'
        })
      }

      // Import database functions dynamically to avoid circular imports
      const { pool } = await import('../lib/database')
      
      let query: string
      let resourceOwnerField: string
      
      switch (resourceType) {
        case 'event':
          query = 'SELECT organiser_id FROM events WHERE id = $1'
          resourceOwnerField = 'organiser_id'
          break
        case 'ticket':
          query = 'SELECT participant_email FROM tickets WHERE id = $1'
          resourceOwnerField = 'participant_email'
          break
        case 'payment':
          query = 'SELECT primary_contact_email FROM payments WHERE id = $1'
          resourceOwnerField = 'primary_contact_email'
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid resource type'
          })
      }

      const result = await pool.query(query, [resourceId])
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`
        })
      }

      const resource = result.rows[0]
      
      // Check ownership based on resource type
      let isOwner = false
      if (resourceType === 'event') {
        isOwner = resource[resourceOwnerField] === req.localUser.userId
      } else {
        // For tickets and payments, check email
        isOwner = resource[resourceOwnerField] === req.localUser.email
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: `Access denied. You don't own this ${resourceType}.`
        })
      }

      next()
      
    } catch (error: any) {
      console.error(`❌ Ownership check error for ${resourceType}:`, error.message)
      return res.status(500).json({
        success: false,
        error: 'Failed to verify resource ownership'
      })
    }
  }
}

/**
 * Specific ownership middleware for common resources
 */
export const requireEventOwnership = requireOwnership('event')
export const requireTicketOwnership = requireOwnership('ticket')
export const requirePaymentOwnership = requireOwnership('payment')
