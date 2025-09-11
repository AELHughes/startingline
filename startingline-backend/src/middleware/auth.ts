import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase'
import type { JwtPayload } from '../types'

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        email: string
        role: string
      }
    }
  }
}

/**
 * Middleware to authenticate JWT token and populate req.user
 * JWT contains auth.users.id, which is now the direct primary key in users table
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Find user in database by id (JWT contains auth.users.id, which is now our direct PK)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, verification_status')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      })
    }

    // Set req.user.userId to users.id (which is the same as auth.users.id)
    req.user = {
      userId: user.id, // This is users.id for foreign keys
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    // Find user in database by id
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, verification_status')
      .eq('id', decoded.userId)
      .single()

    if (!error && user) {
      req.user = {
        userId: user.id, // users.id
        email: user.email,
        role: user.role
      }
    }

    next()
  } catch (error) {
    // Ignore auth errors for optional auth
    next()
  }
}

/**
 * Middleware to require specific role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
    }

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