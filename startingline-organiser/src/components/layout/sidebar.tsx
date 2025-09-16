'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Calendar, 
  User, 
  Settings,
  BarChart3,
  Users,
  FileText,
  MessageSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Participants', href: '/dashboard/participants', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:sticky lg:top-0 lg:h-screen lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-gray-900">
        <div className="flex h-16 flex-shrink-0 items-center px-4">
          <div className="flex items-center w-full">
            <img 
              src="/SL_Logo_WtV2.png" 
              alt="StartingLine" 
              className="h-12 w-auto max-w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                             (item.href !== '/dashboard' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}