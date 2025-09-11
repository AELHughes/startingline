'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useEvents } from '@/hooks/use-events'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AdminAccessButton from '@/components/admin/admin-access-button'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import HeroSlider from '@/components/ui/hero-slider'
import type { Event } from '@/lib/api'

// Hero images from local public/images folder
const heroImages = [
  {
    src: '/images/MTBSlide.jpg',
    alt: 'Mountain Biking Event',
    title: 'Conquer the Trails',
    subtitle: 'Experience the thrill of mountain biking across South Africa\'s most challenging terrain'
  },
  {
    src: '/images/RoadRunningSlide.jpg',
    alt: 'Road Running Event',
    title: 'Run Your Best Race',
    subtitle: 'From 5K fun runs to marathons, find your perfect race on the road'
  },
  {
    src: '/images/TrailSlide.jpg',
    alt: 'Trail Running Event',
    title: 'Hit the Trails',
    subtitle: 'Discover breathtaking trail running adventures in nature\'s playground'
  },
  {
    src: '/images/TriSlide.jpg',
    alt: 'Triathlon Event',
    title: 'Triathlon Excellence',
    subtitle: 'Swim, bike, run - conquer the ultimate endurance challenge'
  }
]

export default function HomePage() {
  const { data: events = [], isLoading } = useEvents()
  const { user, logout } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')

  // Filter events based on search and filters (computed value, no state)
  const filteredEvents = React.useMemo(() => {
    let filtered = events.filter(event => event.status === 'published')

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Province filter
    if (selectedProvince !== 'all') {
      filtered = filtered.filter(event => event.province === selectedProvince)
    }

    return filtered
  }, [events, searchTerm, selectedCategory, selectedProvince])

  const getLowestPrice = (event: Event) => {
    if (!event.distances || event.distances.length === 0) return null
    const prices = event.distances.map(d => d.price).filter(p => p > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'road-cycling', label: 'Road Cycling' },
    { value: 'road-running', label: 'Road Running' },
    { value: 'mountain-biking', label: 'Mountain Biking' },
    { value: 'triathlon', label: 'Triathlon' }
  ]

  const provinces = [
    { value: 'all', label: 'All Provinces' },
    { value: 'Eastern Cape', label: 'Eastern Cape' },
    { value: 'Free State', label: 'Free State' },
    { value: 'Gauteng', label: 'Gauteng' },
    { value: 'KwaZulu-Natal', label: 'KwaZulu-Natal' },
    { value: 'Limpopo', label: 'Limpopo' },
    { value: 'Mpumalanga', label: 'Mpumalanga' },
    { value: 'Northern Cape', label: 'Northern Cape' },
    { value: 'North West', label: 'North West' },
    { value: 'Western Cape', label: 'Western Cape' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Starting Line</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/events" className="text-gray-700 hover:text-blue-600 font-medium">
                All Events
              </Link>
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 font-medium">
                Articles
              </Link>
              <Link href="/organisers" className="text-gray-700 hover:text-blue-600 font-medium">
                Organisers
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Portal</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSlider images={heroImages} />

      {/* Search and Filter Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Event</h2>
            <p className="text-gray-600">Search through hundreds of events across South Africa</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events, cities, venues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province Filter */}
              <div>
                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600">Discover the most exciting events happening near you</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.slice(0, 6).map((event) => {
                const lowestPrice = getLowestPrice(event)
                
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/events/${event.slug || event.id}`}>
                      <CardContent className="p-0">
                        {/* Event Image */}
                        <div className="relative h-48 bg-gray-200">
                          {event.primary_image_url || event.image_url ? (
                            <img
                              src={event.primary_image_url || event.image_url}
                              alt={event.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 text-gray-900">
                              {event.category?.replace('-', ' ')}
                            </Badge>
                          </div>
                          {lowestPrice && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-blue-600 text-white">
                                From R{lowestPrice.toFixed(2)}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="p-6">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                            {event.name}
                          </h3>
                          
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(event.start_date)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.venue_name || event.city}</span>
                            </div>
                            {event.distances && event.distances.length > 0 && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>{event.distances.length} distance{event.distances.length !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {event.province}
                            </span>
                            <Button variant="outline" size="sm">
                              View Details
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later for new events.
              </p>
              <Button onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedProvince('all')
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {filteredEvents.length > 6 && (
            <div className="text-center mt-12">
              <Link href="/events">
                <Button variant="outline" size="lg">
                  View All Events ({filteredEvents.length})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Organise Your Event?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of organisers who trust Starting Line to manage their events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">Starting Line</span>
              </div>
              <p className="text-gray-400">
                Your premier destination for cycling, running, and triathlon events across South Africa.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Events</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/events" className="hover:text-white">All Events</Link></li>
                <li><Link href="/events?category=road-cycling" className="hover:text-white">Road Cycling</Link></li>
                <li><Link href="/events?category=road-running" className="hover:text-white">Road Running</Link></li>
                <li><Link href="/events?category=mountain-biking" className="hover:text-white">Mountain Biking</Link></li>
                <li><Link href="/events?category=triathlon" className="hover:text-white">Triathlon</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Organisers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/organisers" className="hover:text-white">Find Organisers</Link></li>
                <li><Link href="/articles" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Starting Line Events. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Discrete Admin Access Button */}
      <AdminAccessButton />
    </div>
  )
}
