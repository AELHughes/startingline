'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LoggedOutHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">StartingLine</span>
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
          <Link href="/events" className="text-gray-600 hover:text-gray-900">
            Events
          </Link>
          <Link href="/organisers" className="text-gray-600 hover:text-gray-900">
            Organisers
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
