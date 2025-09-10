'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMyEvents } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Users, DollarSign, Plus, Search, Filter, Eye, Edit } from 'lucide-react'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending Approval',
  published: 'Published',
  cancelled: 'Cancelled'
}

export default function EventsPage() {
  const router = useRouter()
  const { data: events = [], isLoading } = useMyEvents()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getLowestPrice = (distances: any[]) => {
    if (!distances || distances.length === 0) return 0
    return Math.min(...distances.map(d => d.price || 0))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-2">Manage your events and track their status</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/events/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, city, or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="road-cycling">Road Cycling</SelectItem>
                  <SelectItem value="road-running">Road Running</SelectItem>
                  <SelectItem value="mountain-biking">Mountain Biking</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-gray-500 mb-4">
              {events.length === 0 ? 'No events yet' : 'No events match your filters'}
            </div>
            {events.length === 0 && (
              <Button 
                onClick={() => router.push('/dashboard/events/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                      <Badge className={STATUS_COLORS[event.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[event.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.start_date)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.city}, {event.province}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {event.distances?.length || 0} distance{(event.distances?.length || 0) !== 1 ? 's' : ''}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        From R{getLowestPrice(event.distances)}
                      </div>
                    </div>

                    {event.venue_name && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Venue:</strong> {event.venue_name}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Event Preview Image */}
                {event.primary_image_url && (
                  <div className="mt-4">
                    <img
                      src={event.primary_image_url}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Event Description Preview */}
                {event.description && (
                  <div className="mt-4">
                    <p className="text-gray-700 line-clamp-2">
                      {event.description.substring(0, 150)}
                      {event.description.length > 150 && '...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
