'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  email_verified: boolean
  last_login_at?: string
  created_at: string
  updated_at?: string
  
  // Extended profile fields
  phone?: string
  company_name?: string
  company_address?: string
  vat_number?: string
  company_registration_number?: string
  company_phone?: string
  company_email?: string
  bank_name?: string
  account_holder_name?: string
  account_number?: string
  branch_code?: string
  account_type?: 'cheque' | 'savings'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      // Clear invalid data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data
        
        setUser(userData)
        setToken(userToken)
        
        // Save to localStorage
        localStorage.setItem('auth_token', userToken)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('user_type', userData.role)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      if (data.success && data.data) {
        const { user: newUser, token: userToken } = data.data
        
        setUser(newUser)
        setToken(userToken)
        
        // Save to localStorage
        localStorage.setItem('auth_token', userToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        localStorage.setItem('user_type', newUser.role)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    console.log('🚪 Logging out user...')
    console.log('🔍 Current token before logout:', localStorage.getItem('auth_token'))
    console.log('🔍 Current user before logout:', localStorage.getItem('user'))
    
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('user_type')
    localStorage.removeItem('admin_user')
    
    localStorage.clear() // More aggressive clearing
    sessionStorage.clear() // Clear session storage as well
    
    console.log('✅ Cleared all localStorage and sessionStorage data')
    console.log('🔍 Token after logout:', localStorage.getItem('auth_token'))
    
    window.location.replace('/login') // Force a hard reload
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
