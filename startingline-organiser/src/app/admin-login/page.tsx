'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasLoggedIn, setHasLoggedIn] = useState(false)
  // Remove loading state for now to fix the blank page issue
  // const [isLoading, setIsLoading] = useState(true)

  // Clear any stale authentication data on page load (only if not logged in)
  useEffect(() => {
    // Only clear auth data if we haven't just logged in
    if (!hasLoggedIn) {
      const clearStaleAuth = () => {
        const staleKeys = ['auth_token', 'user', 'user_type', 'admin_user']
        staleKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            console.log(`🧹 Clearing stale auth data: ${key}`)
            localStorage.removeItem(key)
          }
        })
      }
      
      clearStaleAuth()
    }
  }, [hasLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    console.log('🔍 Frontend: Admin login attempt with:', { email: formData.email, passwordLength: formData.password.length })

    try {
      const requestBody = JSON.stringify(formData)
      console.log('🔍 Frontend: Request body:', requestBody)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      })

      console.log('🔍 Frontend: Response status:', response.status)
      console.log('🔍 Frontend: Response ok:', response.ok)

      const data = await response.json()
      console.log('🔍 Frontend: Response data:', data)

      if (!response.ok) {
        console.log('❌ Frontend: Response not ok, throwing error:', data.error)
        throw new Error(data.error || 'Login failed')
      }

      if (data.success && data.data) {
        const { user: userData, token: userToken } = data.data
        console.log('🔍 Frontend: Login successful, user data:', { email: userData.email, role: userData.role })
        
        // Check if user is admin
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          console.log('✅ Frontend: User is admin, saving to localStorage')
          // Save to localStorage
          localStorage.setItem('auth_token', userToken)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('user_type', userData.role)
          
          // Set flag to prevent clearing auth data
          setHasLoggedIn(true)
          
          // Redirect to admin dashboard using window.location for reliability
          console.log('🔍 Frontend: Redirecting to /admin')
          window.location.href = '/admin'
        } else {
          // Non-admin user trying to access admin portal
          console.log('❌ Frontend: User is not admin, role:', userData.role)
          setErrors({
            general: 'Access denied. Administrator privileges required.'
          })
          return
        }
      } else {
        console.log('❌ Frontend: Invalid response format, data:', data)
        throw new Error('Invalid response format')
      }
    } catch (error: any) {
      console.log('❌ Frontend: Login error caught:', error)
      console.log('❌ Frontend: Error message:', error.message)
      console.log('❌ Frontend: Error stack:', error.stack)
      
      let errorMessage = error.message || 'Login failed. Please try again.'
      
      // Customize error message for admin login
      if (errorMessage.includes('Invalid email or password')) {
        errorMessage = 'Invalid administrator credentials. Please check your email and password.'
      }
      
      setErrors({
        general: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your administrator account
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Administrator Login</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the administration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Authentication Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {errors.general}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Administrator Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@startingline.co.za"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Sign In as Administrator'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Security Notice
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                This is a restricted administrative area. All access attempts are logged and monitored.
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Starting Line
          </Link>
        </div>

        {/* Alternative Login */}
        <div className="text-center border-t pt-6">
          <p className="text-sm text-gray-600">
            Looking for organiser access?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Organiser Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
