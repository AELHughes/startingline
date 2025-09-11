'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useAllEventsAdmin, useUpdateEventStatusAdmin } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  MoreHorizontal,
  LogOut,
  MessageSquare,
  Send
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function AdminEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: events = [], isLoading: eventsLoading } = useAllEventsAdmin()
  const updateEventStatusMutation = useUpdateEventStatusAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [adminNote, setAdminNote] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const handleAdminAction = (event: any, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedEvent(event)
    setAdminAction(action)
    setAdminNote('')
    setShowAdminModal(true)
  }

  const handleSubmitAdminAction = async () => {
    if (!selectedEvent) return

    let status = ''
    switch (adminAction) {
      case 'approve':
        status = 'published'
        break
      case 'reject':
        status = 'cancelled'
        break
      case 'request_info':
        status = 'pending_approval' // Keep as pending but send note
        break
    }

    try {
      await updateEventStatusMutation.mutateAsync({
        eventId: selectedEvent.id,
        status,
        adminNote: adminNote.trim() || undefined
      })

      setShowAdminModal(false)
      setSelectedEvent(null)
      setAdminNote('')
    } catch (error) {
      console.error('Failed to update event status:', error)
      alert('Failed to update event status')
    }
  }

  const getActionTitle = () => {
    switch (adminAction) {
      case 'approve': return 'Approve Event'
      case 'reject': return 'Reject Event'
      case 'request_info': return 'Request More Information'
      default: return 'Admin Action'
    }
  }

  const getActionDescription = () => {
    switch (adminAction) {
      case 'approve': return 'This will publish the event and make it live for participants to register.'
      case 'reject': return 'This will reject the event and notify the organiser.'
      case 'request_info': return 'This will ask the organiser to provide more information or make changes.'
      default: return ''
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />
      case 'pending_approval':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const organiserName = `${event.organiser_first_name || ''} ${event.organiser_last_name || ''}`.trim()
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      organiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleApproveEvent = async (eventId: string) => {
    // TODO: Implement approve event API call
    console.log('Approve event:', eventId)
  }

  const handleRejectEvent = async (eventId: string) => {
    // TODO: Implement reject event API call
    console.log('Reject event:', eventId)
  }

  const handleAdminAction = (event: any, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedEvent(event)
    setAdminAction(action)
    setAdminNote('')
    setShowAdminModal(true)
  }

  const handleSubmitAdminAction = async () => {
    if (!selectedEvent) return

    let status = ''
    switch (adminAction) {
      case 'approve':
        status = 'published'
        break
      case 'reject':
        status = 'cancelled'
        break
      case 'request_info':
        status = 'pending_approval' // Keep as pending but send note
        break
    }

    try {
      await updateEventStatusMutation.mutateAsync({
        eventId: selectedEvent.id,
        status,
        adminNote: adminNote.trim() || undefined
      })

      setShowAdminModal(false)
      setSelectedEvent(null)
      setAdminNote('')
    } catch (error) {
      console.error('Failed to update event status:', error)
      alert('Failed to update event status')
    }
  }

  const getActionTitle = () => {
    switch (adminAction) {
      case 'approve': return 'Approve Event'
      case 'reject': return 'Reject Event'
      case 'request_info': return 'Request More Information'
      default: return 'Admin Action'
    }
  }

  const getActionDescription = () => {
    switch (adminAction) {
      case 'approve': return 'This will publish the event and make it live for participants to register.'
      case 'reject': return 'This will reject the event and notify the organiser.'
      case 'request_info': return 'This will ask the organiser to provide more information or make changes.'
      default: return ''
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600">Manage all platform events</p>
          </div>
          <Badge variant="secondary">
            {filteredEvents.length} events
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events, organisers, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="road-cycling">Road Cycling</SelectItem>
                  <SelectItem value="mountain-biking">Mountain Biking</SelectItem>
                  <SelectItem value="road-running">Road Running</SelectItem>
                  <SelectItem value="trail-running">Trail Running</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your filters to see more events.'
                  : 'No events have been created yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Event Image */}
                        {event.primary_image_url && (
                          <img
                            src={event.primary_image_url}
                            alt={event.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        
                        {/* Event Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {event.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(event.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(event.status)}
                                  <span>{event.status.replace('_', ' ')}</span>
                                </div>
                              </Badge>
                              {event.category && (
                                <Badge variant="outline">
                                  {event.category.replace('-', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(event.start_date)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.city}, {event.province}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{event.organiser_name}</span>
                            </div>
                          </div>

                          {event.description && (
                            <p className="text-gray-700 text-sm line-clamp-2 mb-4">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/events/${event.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {event.status === 'pending_approval' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveEvent(event.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectEvent(event.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* Admin Actions */}
                      {event.status === 'pending_approval' && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAdminAction(event, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdminAction(event, 'request_info')}
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Request Info
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAdminAction(event, 'reject')}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/admin/events/${event.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Public Page
                          </DropdownMenuItem>
                          {event.status === 'published' && (
                            <DropdownMenuItem
                              onClick={() => handleAdminAction(event, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Unpublish Event
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <span>
                  Event: <strong>{selectedEvent.name}</strong> by {selectedEvent.organiser_first_name} {selectedEvent.organiser_last_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {getActionDescription()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-note">
                {adminAction === 'approve' ? 'Approval Note (Optional)' : 
                 adminAction === 'reject' ? 'Rejection Reason (Required)' : 
                 'Information Request (Required)'}
              </Label>
              <Textarea
                id="admin-note"
                placeholder={
                  adminAction === 'approve' ? 'Add any notes for the organiser...' :
                  adminAction === 'reject' ? 'Please explain why this event was rejected...' :
                  'Please describe what additional information or changes are needed...'
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {adminAction !== 'approve' && (
                <p className="text-xs text-gray-500">
                  This message will be sent to the organiser as both a notification and a direct message.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdminModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitAdminAction}
              disabled={updateEventStatusMutation.isPending || (adminAction !== 'approve' && !adminNote.trim())}
              className={
                adminAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                adminAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              }
            >
              {updateEventStatusMutation.isPending ? (
                'Processing...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {adminAction === 'approve' ? 'Approve & Publish' :
                   adminAction === 'reject' ? 'Reject Event' :
                   'Send Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
