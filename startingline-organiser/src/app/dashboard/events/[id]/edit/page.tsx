'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle, Edit, History, MessageSquare } from 'lucide-react'
import EventCreateForm from '@/components/events/event-create-form'
import ChangeRequestModal from '@/components/events/change-request-modal'

interface Event {
  id: string
  name: string
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled'
  created_at: string
  updated_at: string
  [key: string]: any
}

export default function EventEditPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    if (user && eventId) {
      fetchEvent()
    }
  }, [user, eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching event for edit:', eventId)
      
      const response = await eventsApi.getEventById(eventId)
      
      if (response) {
        setEvent(response)
        console.log('✅ Event loaded for editing:', response)
        
        // Check if user owns this event
        if (response.organiser_id !== user?.id) {
          setError('You do not have permission to edit this event')
          return
        }
        
        // Published events can be viewed for change requests, no error needed
        
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

  const handleSubmitForApproval = async () => {
    if (!event) return

    try {
      setSubmitting(true)
      
      const updateData = {
        status: 'pending_approval'
      }
      
      await eventsApi.updateEvent(event.id, updateData)
      
      console.log('✅ Event submitted for approval')
      
      // Refresh the event data
      await fetchEvent()
      
      // Show success message or redirect
      router.push('/dashboard/events')
      
    } catch (error: any) {
      console.error('❌ Failed to submit for approval:', error)
      setError('Failed to submit event for approval')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChangeRequest = async (changeRequest: string) => {
    if (!event) return

    try {
      // Create audit trail entry for change request
      await fetch(`http://localhost:5001/api/events/${event.id}/audit-trail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action_type: 'change_requested',
          message: `Change request: ${changeRequest}`
        })
      })
      
      console.log('✅ Change request sent to admin')
      
      // Show success message
      alert('Your change request has been sent to the administrators. They will review and respond shortly.')
      
      // Refresh the page to show the new audit trail entry
      window.location.reload()
      
    } catch (error: any) {
      console.error('❌ Failed to submit change request:', error)
      throw new Error('Failed to submit change request')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
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
              <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have permission to edit it.</p>
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
          {/* Page Title and Description - Top Left */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <Edit className="h-7 w-7 mr-3" />
              Edit Event
            </h1>
            <p className="text-gray-600 text-lg">Make changes to your event details</p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Navigation and Secondary Actions */}
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
              <Button
                onClick={() => router.push(`/dashboard/events/${eventId}/comments`)}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Admin Comments
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/events/${event.id}/history`)}
                variant="outline"
                size="sm"
                className="flex items-center text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>

            {/* Right Side - Status */}
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(event.status)}
            </div>
          </div>

          {/* Status Information */}
          <Card className="mt-8 mb-6">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                {event.status === 'draft' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : event.status === 'pending_approval' ? (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {event.status === 'draft' && 'Draft Mode - You can edit freely'}
                    {event.status === 'pending_approval' && 'Pending Approval - Limited editing available'}
                    {event.status === 'published' && 'Published - Event is live'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.status === 'draft' && 'When you\'re ready, click "Request to Publish" to submit for admin approval.'}
                    {event.status === 'pending_approval' && 'Your event is being reviewed by administrators. You can still make essential edits.'}
                    {event.status === 'published' && 'Your event is now live and visible to the public. You can request changes from administrators.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Edit Form or Change Request */}
        {event.status === 'draft' ? (
          <EventCreateForm 
            initialData={event}
            isEditing={true}
            eventId={event.id}
            canEdit={true}
          />
        ) : event.status === 'pending_approval' ? (
          <div className="space-y-4">
            {/* Warning about admin notifications */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Event Under Review</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your event is currently being reviewed by administrators. Any changes you make will be logged and administrators will be notified.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Edit Form for Pending Approval Events */}
            <EventCreateForm 
              initialData={event}
              isEditing={true}
              eventId={event.id}
              canEdit={true}
            />
          </div>
        ) : event.status === 'published' ? (
          <div className="space-y-4">
            {/* Published Event Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Event Published</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your event is now live and visible to the public. To make changes, please submit a change request.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Change Request for Published Events */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Edit className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Request Changes
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your event is live and visible to the public. To make changes, you can request modifications that will be reviewed by administrators.
                  </p>
                  <Button
                    onClick={() => setShowChangeRequestModal(true)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Status: {event.status}
                </h3>
                <p className="text-gray-600">
                  This event cannot be edited in its current status.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Change Request Modal */}
        <ChangeRequestModal
          isOpen={showChangeRequestModal}
          onClose={() => setShowChangeRequestModal(false)}
          eventName={event.name}
          eventId={event.id}
          eventStatus={event.status}
          onSubmit={handleChangeRequest}
        />
      </div>
    </div>
  )
}
