'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { user, login, isLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Clear any stale authentication data on page load
  useEffect(() => {
    // Clear any cached auth data that might cause conflicts
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
  }, [])

  // Cross-auth protection: Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'organiser') {
        router.push('/dashboard')
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        // Prevent admin from accessing organiser login
        router.push('/admin')
      } else if (user.role === 'participant') {
        // Redirect participants to their dashboard
        router.push('/participant-dashboard')
      } else {
        // Unknown role, redirect to appropriate login
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  // Don't render if still loading or already authenticated
  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      await login(formData.email, formData.password)
      
      // After successful login, check user role and redirect appropriately
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        if (userData.role === 'organiser') {
          router.push('/dashboard')
        } else if (userData.role === 'admin' || userData.role === 'super_admin') {
          // Admin user trying to access organiser portal
          setErrors({
            general: 'This is the organiser portal. Please use the admin portal to access administrator features.'
          })
          // Clear auth and redirect
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          localStorage.removeItem('user_type')
          return
        } else if (userData.role === 'participant') {
          // Participant user - redirect to participant dashboard
          router.push('/participant-dashboard')
        } else {
          // Unknown role
          setErrors({
            general: 'Your account role is not recognized. Please contact support.'
          })
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          localStorage.removeItem('user_type')
          return
        }
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Login failed. Please try again.'
      
      // Customize error message for organiser login
      if (errorMessage.includes('Invalid email or password')) {
        errorMessage = 'Invalid organiser credentials. Please check your email and password.'
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
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your organiser account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="mb-2 font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Administrator access?{' '}
                <Link href="/admin-login" className="font-medium text-red-600 hover:text-red-500">
                  Admin Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Starting Line Events. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
