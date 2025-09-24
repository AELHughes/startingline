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
  updateAuthState: (user: User, token: string) => void
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
      
      console.log('🔍 Auth Context: Loading from localStorage - token:', !!savedToken, 'user:', !!savedUser)
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser)
        console.log('🔍 Auth Context: Setting user from localStorage:', { id: userData.id, email: userData.email, role: userData.role })
        setToken(savedToken)
        setUser(userData)
      } else {
        console.log('🔍 Auth Context: No saved auth data found')
      }
    } catch (error) {
      console.error('❌ Auth Context: Error loading auth state:', error)
      // Clear invalid data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      console.log('🔍 Auth Context: Setting isLoading to false')
      setIsLoading(false)
    }
  }, [])

  // Cross-tab logout and login synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Listen for logout signal from other tabs
      if (e.key === 'logout_signal' && e.newValue) {
        console.log('🔄 Cross-tab logout detected, logging out this tab...')
        
        // Clear local state immediately
        setUser(null)
        setToken(null)
        
        // Clear storage without triggering another storage event
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('user_type')
        
        // Redirect to login
        window.location.replace('/login')
      }
      
      // Listen for login signal from other tabs
      if (e.key === 'login_signal' && e.newValue) {
        console.log('🔄 Cross-tab login detected, updating this tab...')
        
        try {
          const savedToken = localStorage.getItem('auth_token')
          const savedUser = localStorage.getItem('user')
          
          if (savedToken && savedUser) {
            const userData = JSON.parse(savedUser)
            console.log('🔄 Updating auth state from cross-tab login')
            setToken(savedToken)
            setUser(userData)
            
            // If we're on the login page, redirect to appropriate dashboard
            if (window.location.pathname === '/login' || window.location.pathname === '/admin/login') {
              const userRole = userData.role
              if (userRole === 'admin') {
                window.location.replace('/admin/dashboard')
              } else {
                window.location.replace('/dashboard')
              }
            }
          }
        } catch (error) {
          console.error('❌ Error handling cross-tab login:', error)
        }
      }
      
      // Also listen for direct removal of auth_token (manual logout detection)
      if (e.key === 'auth_token' && !e.newValue && e.oldValue) {
        console.log('🔄 Auth token removed in another tab, logging out this tab...')
        
        // Clear local state
        setUser(null)
        setToken(null)
        
        // Redirect to login
        window.location.replace('/login')
      }
      
      // Listen for new auth_token (login detection)
      if (e.key === 'auth_token' && e.newValue && !e.oldValue) {
        console.log('🔄 New auth token detected in another tab, updating this tab...')
        
        try {
          const savedUser = localStorage.getItem('user')
          if (e.newValue && savedUser) {
            const userData = JSON.parse(savedUser)
            console.log('🔄 Updating auth state from detected login')
            setToken(e.newValue)
            setUser(userData)
          }
        } catch (error) {
          console.error('❌ Error handling token change:', error)
        }
      }
    }

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange)

    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange)
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
        
        // Send login signal to other tabs
        try {
          localStorage.setItem('login_signal', Date.now().toString())
          console.log('📡 Cross-tab login signal sent')
          
          // Remove the signal after a short delay
          setTimeout(() => {
            localStorage.removeItem('login_signal')
          }, 100)
        } catch (error) {
          console.warn('⚠️ Failed to send cross-tab login signal:', error)
        }
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
        
        // Send login signal to other tabs
        try {
          localStorage.setItem('login_signal', Date.now().toString())
          console.log('📡 Cross-tab login signal sent')
          
          // Remove the signal after a short delay
          setTimeout(() => {
            localStorage.removeItem('login_signal')
          }, 100)
        } catch (error) {
          console.warn('⚠️ Failed to send cross-tab login signal:', error)
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    console.log('🚪 Logging out user...')
    console.log('🔍 Current token before logout:', localStorage.getItem('auth_token'))
    console.log('🔍 Current user before logout:', localStorage.getItem('user'))
    
    try {
      // Call backend logout endpoint to invalidate token
      const currentToken = localStorage.getItem('auth_token')
      if (currentToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        })
        console.log('✅ Backend logout called successfully')
      }
    } catch (error) {
      console.warn('⚠️ Backend logout failed (continuing with client-side logout):', error)
    }
    
    // Send logout signal to other tabs BEFORE clearing storage
    // This ensures other tabs receive the signal before we clear everything
    try {
      localStorage.setItem('logout_signal', Date.now().toString())
      console.log('📡 Cross-tab logout signal sent')
      
      // Remove the signal after a short delay to allow other tabs to receive it
      setTimeout(() => {
        localStorage.removeItem('logout_signal')
      }, 100)
    } catch (error) {
      console.warn('⚠️ Failed to send cross-tab logout signal:', error)
    }
    
    // Clear all state and storage
    setUser(null)
    setToken(null)
    
    // Clear all possible localStorage keys
    const keysToRemove = [
      'auth_token', 'user', 'user_type', 'admin_user', 
      'token', 'authToken', 'userData', 'user_data',
      'session', 'sessionToken', 'jwt', 'jwt_token'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
    // More aggressive clearing (but preserve logout_signal temporarily)
    const logoutSignal = localStorage.getItem('logout_signal')
    localStorage.clear()
    sessionStorage.clear()
    
    // Restore logout signal briefly for other tabs
    if (logoutSignal) {
      localStorage.setItem('logout_signal', logoutSignal)
    }
    
    // Clear any cookies that might contain auth data
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    
    console.log('✅ Cleared all localStorage, sessionStorage, and cookies')
    console.log('🔍 Token after logout:', localStorage.getItem('auth_token'))
    
    // Force a hard reload to clear any cached state
    window.location.replace('/login')
  }

  const updateAuthState = (newUser: User, newToken: string) => {
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateAuthState,
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
