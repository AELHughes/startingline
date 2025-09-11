'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function AdminAccessButton() {
  const { user } = useAuth()
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)

  // Don't show if user is already logged in
  if (user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Tooltip */}
      {isTooltipVisible && (
        <div className="absolute bottom-16 right-0 mb-2">
          <div className="bg-gray-900 text-white text-xs py-2 px-3 rounded-lg shadow-lg whitespace-nowrap">
            Administrator Access
            <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Admin Access Button */}
      <Link href="/admin-login">
        <Button
          size="sm"
          className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 shadow-lg border border-red-500 p-0"
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
          aria-label="Administrator Login"
        >
          <Shield className="h-4 w-4 text-white" />
        </Button>
      </Link>
    </div>
  )
}
