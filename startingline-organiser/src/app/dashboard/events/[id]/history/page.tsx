'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, History, AlertCircle, Calendar, MapPin } from 'lucide-react'
import EventAuditTrail from '@/components/events/event-audit-trail'

interface Event {
  id: string
  name: string
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled'
  start_date: string
  venue_name: string
  city: string
  province: string
  created_at: string
  updated_at: string
  [key: string]: any
}

export default function EventHistoryPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventId = params.id as string

  useEffect(() => {
    if (user && eventId) {
      fetchEvent()
    }
  }, [user, eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching event for history:', eventId)
      
      const response = await eventsApi.getEventById(eventId)
      
      if (response) {
        setEvent(response)
        console.log('✅ Event loaded for history:', response)
        
        // Check if user owns this event
        if (response.organiser_id !== user?.id) {
          setError('You do not have permission to view this event history')
          return
        }
        
      } else {
        setError('Event not found')
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch event:', error)
      setError('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Published</Badge>
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Event</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                onClick={() => router.push('/dashboard/events')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Event Not Found</h2>
              <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have permission to view it.</p>
              <Button 
                onClick={() => router.push('/dashboard/events')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          {/* Page Title and Description - Top */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <History className="h-7 w-7 mr-3" />
              Event History
            </h1>
            <p className="text-gray-600 text-lg">Complete timeline of all changes and updates</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => router.push('/dashboard/events')}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </div>

            {/* Right Side - Status and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(event.status)}
              <Button
                onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                variant="outline"
                size="sm"
              >
                Edit Event
              </Button>
            </div>
          </div>

          {/* Event Summary Card */}
          <Card className="mt-8 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{event.name}</span>
                {getStatusBadge(event.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Start Date: {formatDate(event.start_date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Location: {event.venue_name}, {event.city}</span>
                </div>
                <div className="text-gray-600">
                  <span>Province: {event.province}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <strong>Created:</strong> {formatDate(event.created_at)}
                </div>
                <div>
                  <strong>Last Updated:</strong> {formatDate(event.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complete Audit Trail */}
        <EventAuditTrail eventId={event.id} />
      </div>
    </div>
  )
}
