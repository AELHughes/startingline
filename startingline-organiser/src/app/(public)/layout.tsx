'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { LoggedOutHeader } from '@/components/LoggedOutHeader'
import Header from '@/components/layout/header'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Only redirect authenticated users from login/register pages
  useEffect(() => {
    if (!isLoading && user) {
      if (pathname === '/login' || pathname === '/register') {
        if (user.role === 'organiser') {
          router.push('/dashboard')
        } else if (user.role === 'admin' || user.role === 'super_admin') {
          router.push('/admin')
        } else if (user.role === 'participant') {
          router.push('/participant-dashboard')
        }
      }
    }
  }, [user, isLoading, router, pathname])

  // Show loading state only on login/register pages
  if (isLoading && (pathname === '/login' || pathname === '/register')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <Header /> : <LoggedOutHeader />}
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}