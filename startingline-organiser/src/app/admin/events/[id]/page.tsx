'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useEvent } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar, MapPin, Users, Package, DollarSign, Eye } from 'lucide-react'

export default function AdminEventDetailsPage() {
  const params = useParams()
  const eventId = params.id as string
  const { data: event, isLoading, error } = useEvent(eventId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
        <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const time = new Date()
    time.setHours(parseInt(hours), parseInt(minutes))
    return time.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {event.category?.replace('-', ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {/* View Public Event Button - Always visible */}
          <Button
            variant="outline"
            onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Event
          </Button>
          
          <Button variant="outline">
            Edit Event
          </Button>
          
          {event.status === 'pending_approval' && (
            <div className="flex space-x-2">
              <Button variant="default">
                Approve
              </Button>
              <Button variant="destructive">
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.primary_image_url && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={event.primary_image_url}
                  alt={event.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date & Time
                  </h4>
                  <div className="text-gray-600">
                    <div>{formatDate(event.start_date)}</div>
                    <div>{formatTime(event.start_time)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </h4>
                  <div className="text-gray-600">
                    {event.venue_name && <div>{event.venue_name}</div>}
                    <div>{event.address}</div>
                    <div>{event.city}, {event.province}</div>
                  </div>
                </div>

                {event.organiser_name && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Organiser</h4>
                    <div className="text-gray-600">{event.organiser_name}</div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                  <div className="text-gray-600">{event.category?.replace('-', ' ')}</div>
                </div>
              </div>

              {event.description && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <div className="text-gray-600 whitespace-pre-wrap">{event.description}</div>
                </div>
              )}

              {event.license_required && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Licensing</h4>
                  <div className="text-gray-600">
                    <div className="flex items-center mb-2">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                        Temporary license required
                      </span>
                    </div>
                    {event.temp_license_fee && event.temp_license_fee > 0 && (
                      <div>License fee: R{event.temp_license_fee.toFixed(2)}</div>
                    )}
                    {event.license_details && (
                      <div className="mt-2">{event.license_details}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distances */}
          {event.distances && event.distances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Event Distances ({event.distances.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.distances.map((distance) => (
                    <div key={distance.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{distance.name}</h4>
                        <span className="text-lg font-bold text-blue-600">
                          R{distance.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Distance:</span> {distance.distance_km}km
                        </div>
                        {distance.min_age && (
                          <div>
                            <span className="font-medium">Min Age:</span> {distance.min_age}
                          </div>
                        )}
                        {distance.entry_limit && (
                          <div>
                            <span className="font-medium">Limit:</span> {distance.entry_limit}
                          </div>
                        )}
                        {distance.start_time && (
                          <div>
                            <span className="font-medium">Start:</span> {formatTime(distance.start_time)}
                          </div>
                        )}
                      </div>
                      {(distance.free_for_seniors || distance.free_for_disability) && (
                        <div className="mt-2 flex space-x-2">
                          {distance.free_for_seniors && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Free for seniors ({distance.senior_age_threshold || 65}+)
                            </span>
                          )}
                          {distance.free_for_disability && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Free for disability
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Merchandise */}
          {event.merchandise && event.merchandise.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Event Merchandise ({event.merchandise.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.merchandise.map((merch) => (
                    <div key={merch.id} className="border rounded-lg p-4">
                      <div className="flex space-x-4">
                        {merch.image_url && (
                          <img
                            src={merch.image_url}
                            alt={merch.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{merch.name}</h4>
                            <span className="text-lg font-bold text-blue-600">
                              R{merch.price.toFixed(2)}
                            </span>
                          </div>
                          {merch.description && (
                            <p className="text-gray-600 text-sm mb-2">{merch.description}</p>
                          )}
                          {merch.variations && merch.variations.length > 0 && (
                            <div className="space-y-1">
                              {merch.variations.map((variation) => (
                                <div key={variation.id} className="text-xs">
                                  <span className="font-medium">{variation.variation_name}:</span>{' '}
                                  {variation.variation_options.join(', ')}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Preview Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                View Registrations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payments
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className={getStatusColor(event.status)}>
                  {event.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distances</span>
                <span className="font-medium">{event.distances?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Merchandise</span>
                <span className="font-medium">{event.merchandise?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Event ID Info */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Event ID:</span>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                  {event.id}
                </div>
              </div>
              {event.slug && (
                <div>
                  <span className="text-gray-600 text-sm">Slug:</span>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {event.slug}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
