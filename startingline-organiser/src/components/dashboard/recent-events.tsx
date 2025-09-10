'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Eye } from 'lucide-react'
import type { Event } from '@/lib/supabase-api'

interface RecentEventsProps {
  events: Event[]
}

export default function RecentEvents({ events }: RecentEventsProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getLowestPrice = (event: Event) => {
    if (!event.event_distances || event.event_distances.length === 0) {
      return null
    }
    
    const prices = event.event_distances.map(d => d.price).filter(p => p > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
        <CardDescription>Your latest events</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard/events/create')}
            >
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const lowestPrice = getLowestPrice(event)
              
              return (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-3">
                      {/* Event Image */}
                      <div className="flex-shrink-0">
                        {event.primary_image_url || event.image_url ? (
                          <img
                            src={event.primary_image_url || event.image_url}
                            alt={event.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {event.name}
                        </h3>
                        
                        <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(event.start_date)}
                          </span>
                          
                          {(event.venue_name || event.location || event.city) && (
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {event.venue_name || event.location || event.city}
                            </span>
                          )}
                          
                          {event.event_distances && event.event_distances.length > 0 && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {event.event_distances.length} distance{event.event_distances.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {lowestPrice && (
                          <div className="mt-1">
                            <span className="text-xs text-green-600 font-medium">
                              From R{lowestPrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                          
                          {event.category && (
                            <Badge variant="outline" className="text-xs">
                              {event.category.replace('-', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                      >
                        Edit
                      </Button>
                      
                      {event.status === 'published' && event.slug && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {events.length > 0 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/events')}
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
