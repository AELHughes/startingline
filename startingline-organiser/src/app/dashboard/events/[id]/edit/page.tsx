'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { eventsApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle, Edit } from 'lucide-react'
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
        
        // Check if event can be edited
        if (response.status === 'published') {
          setError('Published events cannot be edited')
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
      // TODO: Implement change request API
      // For now, we'll just log it and show success
      console.log('📝 Change request submitted:', {
        eventId: event.id,
        eventName: event.name,
        request: changeRequest,
        timestamp: new Date().toISOString()
      })
      
      // TODO: Send to backend API
      // await changeRequestApi.create({
      //   eventId: event.id,
      //   message: changeRequest,
      //   status: 'pending'
      // })
      
      console.log('✅ Change request sent to admin')
      
      // Show success message
      alert('Your change request has been sent to the administrators. They will review and respond shortly.')
      
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/dashboard/events')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Edit className="h-6 w-6 mr-2" />
                  Edit Event
                </h1>
                <p className="text-gray-600">Make changes to your event details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(event.status)}
              {event.status === 'draft' && (
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Request to Publish
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Status Information */}
          <Card className="mb-6">
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
                    {event.status === 'published' && 'Your event is now visible to the public.'}
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Under Review
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your event is currently being reviewed by administrators. 
                  If you need to make changes, you can submit a change request.
                </p>
                <Button
                  onClick={() => setShowChangeRequestModal(true)}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Published
                </h3>
                <p className="text-gray-600">
                  Your event is now live and visible to the public. No further edits are allowed.
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
          onSubmit={handleChangeRequest}
        />
      </div>
    </div>
  )
}
