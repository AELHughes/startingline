'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  Users, 
  User, 
  LogOut,
  Menu,
  X,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

interface ParticipantLayoutProps {
  children: React.ReactNode
}

export default function ParticipantLayout({ children }: ParticipantLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/participant-dashboard',
      icon: LayoutDashboard,
      current: pathname === '/participant-dashboard'
    },
    {
      name: 'My Events',
      href: '/participant-dashboard/events',
      icon: Calendar,
      current: pathname === '/participant-dashboard/events'
    },
    {
      name: 'Past Events',
      href: '/participant-dashboard/past-events',
      icon: History,
      current: pathname === '/participant-dashboard/past-events'
    },
    {
      name: 'Members',
      href: '/participant-dashboard/members',
      icon: Users,
      current: pathname === '/participant-dashboard/members'
    },
    {
      name: 'Profile',
      href: '/participant-dashboard/profile',
      icon: User,
      current: pathname === '/participant-dashboard/profile'
    }
  ]

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">StartingLine</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">StartingLine</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}