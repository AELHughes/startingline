'use client'

import React, { useState } from 'react'
import { useAllEventsAdmin, useUpdateEventStatusAdmin } from '@/hooks/use-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react'

export default function AdminEventsPage() {
  const { data: events = [], isLoading: eventsLoading } = useAllEventsAdmin()
  const updateEventStatusMutation = useUpdateEventStatusAdmin()
  
  // Modal state
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [adminNote, setAdminNote] = useState('')

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

  const handleAdminAction = (event: any, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedEvent(event)
    setAdminAction(action)
    setAdminNote('')
    setShowAdminModal(true)
  }

  const handleSubmitAdminAction = async () => {
    if (!selectedEvent) return

    try {
      let newStatus = ''
      switch (adminAction) {
        case 'approve':
          newStatus = 'published'
          break
        case 'reject':
          newStatus = 'cancelled'
          break
        case 'request_info':
          newStatus = 'pending_approval' // Keep as pending but send note
          break
      }

      await updateEventStatusMutation.mutateAsync({
        eventId: selectedEvent.id,
        status: newStatus,
        adminNote: adminNote || undefined
      })

      setShowAdminModal(false)
      setSelectedEvent(null)
      setAdminNote('')
    } catch (error) {
      console.error('Failed to update event status:', error)
    }
  }

  const getActionTitle = () => {
    switch (adminAction) {
      case 'approve':
        return 'Approve Event'
      case 'reject':
        return 'Reject Event'
      case 'request_info':
        return 'Request More Information'
      default:
        return 'Admin Action'
    }
  }

  const getActionDescription = () => {
    switch (adminAction) {
      case 'approve':
        return 'This event will be published and visible to the public.'
      case 'reject':
        return 'This event will be cancelled and the organiser will be notified.'
      case 'request_info':
        return 'Send a message to the organiser requesting more information or changes.'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600">Manage all platform events</p>
      </div>

      {eventsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      )}

      {!eventsLoading && events.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">No events have been created yet.</p>
          </CardContent>
        </Card>
      )}

      {!eventsLoading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      by {event.organiser_first_name} {event.organiser_last_name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {event.city}, {event.province}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                    
                    {/* Admin Action Buttons */}
                    {event.status === 'pending_approval' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAdminAction(event, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdminAction(event, 'request_info')}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Request Info
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdminAction(event, 'reject')}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {event.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                        className="border-gray-600 text-gray-600 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Public
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Action Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {getActionDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEvent && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedEvent.name}</h4>
                <p className="text-sm text-gray-600">
                  by {selectedEvent.organiser_first_name} {selectedEvent.organiser_last_name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedEvent.city}, {selectedEvent.province}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="adminNote">
                {adminAction === 'request_info' ? 'Message to Organiser' : 'Admin Note (Optional)'}
              </Label>
              <Textarea
                id="adminNote"
                placeholder={
                  adminAction === 'request_info' 
                    ? 'Please provide more details about...'
                    : 'Add any notes about this action...'
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAdminAction}
                disabled={updateEventStatusMutation.isPending}
                className={
                  adminAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : adminAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              >
                {updateEventStatusMutation.isPending ? 'Processing...' : getActionTitle()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}