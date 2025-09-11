'use client'

import React, { useState, useMemo } from 'react'
import { useAllEventsAdmin, useUpdateEventStatusAdmin } from '@/hooks/use-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, MessageSquare, Eye, Search, Filter, SortAsc, SortDesc } from 'lucide-react'

export default function AdminEventsPage() {
  const { data: events = [], isLoading: eventsLoading } = useAllEventsAdmin()
  const updateEventStatusMutation = useUpdateEventStatusAdmin()
  
  // Modal state
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [adminNote, setAdminNote] = useState('')
  
  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [organiserFilter, setOrganiserFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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

  // Get unique organisers for filter
  const organisers = useMemo(() => {
    const uniqueOrganisers = new Set()
    events.forEach(event => {
      if (event.organiser_first_name && event.organiser_last_name) {
        uniqueOrganisers.add(`${event.organiser_first_name} ${event.organiser_last_name}`)
      }
    })
    return Array.from(uniqueOrganisers).sort()
  }, [events])

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      // Search filter
      const matchesSearch = !searchTerm || 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.organiser_first_name && event.organiser_first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.organiser_last_name && event.organiser_last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.province.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || event.status === statusFilter

      // Organiser filter
      const organiserName = event.organiser_first_name && event.organiser_last_name 
        ? `${event.organiser_first_name} ${event.organiser_last_name}`
        : ''
      const matchesOrganiser = organiserFilter === 'all' || organiserName === organiserFilter

      return matchesSearch && matchesStatus && matchesOrganiser
    })

    // Sort events
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'recent':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'event_date':
          comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'organiser':
          const aOrganiser = a.organiser_first_name && a.organiser_last_name 
            ? `${a.organiser_first_name} ${a.organiser_last_name}`
            : ''
          const bOrganiser = b.organiser_first_name && b.organiser_last_name 
            ? `${b.organiser_first_name} ${b.organiser_last_name}`
            : ''
          comparison = aOrganiser.localeCompare(bOrganiser)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [events, searchTerm, statusFilter, organiserFilter, sortBy, sortOrder])

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600">Manage all platform events</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Organiser Filter */}
          <Select value={organiserFilter} onValueChange={setOrganiserFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by organiser" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organisers</SelectItem>
              {organisers.map((organiser) => (
                <SelectItem key={organiser} value={organiser}>
                  {organiser}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 flex items-center">Sort by:</span>
          {[
            { key: 'recent', label: 'Recent Submission' },
            { key: 'event_date', label: 'Event Date' },
            { key: 'name', label: 'Event Name' },
            { key: 'organiser', label: 'Organiser' },
            { key: 'status', label: 'Status' }
          ].map((option) => (
            <Button
              key={option.key}
              variant={sortBy === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange(option.key)}
              className="flex items-center gap-1"
            >
              {option.label}
              {sortBy === option.key && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedEvents.length} of {events.length} events
        </div>
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

      {!eventsLoading && events.length > 0 && filteredAndSortedEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events match your filters</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      )}

      {!eventsLoading && filteredAndSortedEvents.length > 0 && (
        <div className="space-y-4">
          {filteredAndSortedEvents.map((event) => (
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
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/admin/events/${event.id}`, '_blank')}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      
                      {event.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
                          className="border-gray-600 text-gray-600 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Public
                        </Button>
                      )}
                    </div>
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