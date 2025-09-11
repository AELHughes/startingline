'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useEventBySlug } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, MapPin, Clock, Users, DollarSign, Package, Camera, ArrowLeft, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import AdminAccessButton from '@/components/admin/admin-access-button'

export default function EventPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: event, isLoading, error } = useEventBySlug(slug)
  
  // Fixed: Define selectedMerchandise state
  const [selectedMerchandise, setSelectedMerchandise] = useState<{[key: string]: string}>({})

  const resetForm = () => {
    setSelectedMerchandise({})
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
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

  const getLowestPrice = () => {
    if (!event.distances || event.distances.length === 0) return null
    const prices = event.distances.map(d => Number(d.price)).filter(p => p > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  const lowestPrice = getLowestPrice()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-700">
        {event.primary_image_url && (
          <Image
            src={event.primary_image_url}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {event.category?.replace('-', ' ')}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {event.status?.replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
              <div className="flex flex-wrap items-center space-x-6 text-white/90">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{formatTime(event.start_time)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.venue_name || event.city}</span>
                </div>
                {lowestPrice && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>From R{Number(lowestPrice).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No description available for this event.</p>
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatTime(event.start_time)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <div className="space-y-1 text-gray-600">
                      {event.venue_name && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.venue_name}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        {event.address}
                        <br />
                        {event.city}, {event.province}
                      </div>
                    </div>
                  </div>

                  {event.organiser_name && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Organiser</h4>
                      <div className="text-gray-600">
                        <span>{event.organiser_name}</span>
                      </div>
                    </div>
                  )}

                  {event.license_required && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Licensing</h4>
                      <div className="text-gray-600">
                        <div className="flex items-center mb-1">
                          <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Temporary license required
                          </span>
                        </div>
                        {event.temp_license_fee && Number(event.temp_license_fee) > 0 && (
                          <div className="text-sm">
                            License fee: R{Number(event.temp_license_fee).toFixed(2)}
                          </div>
                        )}
                        {event.license_details && (
                          <div className="text-sm mt-2">
                            {event.license_details}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Distances */}
            {event.distances && event.distances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Available Distances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.distances.map((distance) => (
                      <div key={distance.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{distance.name}</h4>
                          <span className="text-lg font-bold text-blue-600">
                            R{Number(distance.price).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Distance: {distance.distance_km}km</div>
                          {distance.min_age && (
                            <div>Minimum age: {distance.min_age} years</div>
                          )}
                          {distance.entry_limit && (
                            <div>Entry limit: {distance.entry_limit} participants</div>
                          )}
                          {distance.start_time && (
                            <div>Start time: {formatTime(distance.start_time)}</div>
                          )}
                          {(distance.free_for_seniors || distance.free_for_disability) && (
                            <div className="mt-2 space-y-1">
                              {distance.free_for_seniors && (
                                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mr-2">
                                  Free for seniors ({distance.senior_age_threshold || 65}+)
                                </div>
                              )}
                              {distance.free_for_disability && (
                                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block">
                                  Free for disability
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                    Event Merchandise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.merchandise.map((merch) => (
                      <div key={merch.id} className="border rounded-lg p-4">
                        <div className="flex space-x-4">
                          {merch.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={merch.image_url}
                                alt={merch.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{merch.name}</h4>
                              <span className="text-lg font-bold text-blue-600">
                                R{Number(merch.price).toFixed(2)}
                              </span>
                            </div>
                            {merch.description && (
                              <p className="text-sm text-gray-600 mb-3">{merch.description}</p>
                            )}
                            
                            {/* Variations */}
                            {merch.variations && merch.variations.length > 0 && (
                              <div className="space-y-2">
                                {merch.variations.map((variation) => (
                                  <div key={variation.id}>
                                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                      {variation.variation_name}
                                    </label>
                                    <div className="grid grid-cols-3 gap-1 mt-1">
                                      {variation.variation_options.map((option: string, index: number) => (
                                        <button
                                          key={`${variation.id}-${index}`}
                                          className={`p-2 border rounded cursor-pointer transition-all ${
                                            selectedMerchandise[merch.id] === variation.id 
                                              ? 'border-blue-500 bg-blue-50' 
                                              : 'border-gray-200 hover:border-gray-300'
                                          }`}
                                          onClick={() => {
                                            setSelectedMerchandise(prev => ({
                                              ...prev,
                                              [merch.id]: variation.id
                                            }))
                                          }}
                                        >
                                          <span className="text-xs">{option}</span>
                                        </button>
                                      ))}
                                    </div>
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
            {/* Registration Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Register for Event</CardTitle>
                <CardDescription>
                  Choose your distance and complete registration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowestPrice && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        From R{Number(lowestPrice).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Entry fee</div>
                    </div>
                  )}
                  
                  <Button className="w-full" size="lg">
                    Register Now
                  </Button>
                  
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Event
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <Badge variant="secondary">
                    {event.category?.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge 
                    variant={event.status === 'published' ? 'default' : 'secondary'}
                  >
                    {event.status?.replace('_', ' ')}
                  </Badge>
                </div>
                
                {event.distances && event.distances.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Distances</span>
                    <span className="font-medium">
                      {event.distances.length} option{event.distances.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {event.merchandise && event.merchandise.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Merchandise</span>
                    <span className="font-medium">
                      {event.merchandise.length} item{event.merchandise.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Discrete Admin Access Button */}
      <AdminAccessButton />
    </div>
  )
}
