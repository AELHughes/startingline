'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { eventsApi } from '@/lib/api'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Eye, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Clock,
  FileText,
  Image,
  ShoppingBag,
  Award,
  MessageCircle
} from 'lucide-react'

// Use the existing API service to fetch event details
const fetchEventDetails = async (eventId: string) => {
  return await eventsApi.getEventById(eventId)
}

export default function AdminEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | 'request_info'>('approve')
  const [adminNote, setAdminNote] = useState('')
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [sectionComment, setSectionComment] = useState('')

  // Fetch real event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventDetails(eventId),
    enabled: !!eventId
  })

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
          <p className="text-gray-600">The event you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Mock data for comments - replace with real API call when available
  const comments = [
    {
      id: 1,
      section: 'location',
      comment: 'Please provide more specific directions to the venue',
      admin: 'System Administrator',
      created_at: '2024-01-15T11:00:00Z'
    }
  ]

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

  const handleAdminAction = (action: 'approve' | 'reject' | 'request_info') => {
    setAdminAction(action)
    setAdminNote('')
    setShowAdminModal(true)
  }

  const handleSubmitAdminAction = async () => {
    try {
      // TODO: Implement admin action API call
      console.log('Admin action:', adminAction, 'Note:', adminNote)
      setShowAdminModal(false)
    } catch (error) {
      console.error('Failed to submit admin action:', error)
    }
  }

  const handleAddComment = (section: string) => {
    setSelectedSection(section)
    setSectionComment('')
    setShowCommentModal(true)
  }

  const handleSubmitComment = async () => {
    try {
      // TODO: Implement add comment API call
      console.log('Adding comment for section:', selectedSection, 'Comment:', sectionComment)
      setShowCommentModal(false)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const getSectionComments = (section: string) => {
    return comments.filter(comment => comment.section === section)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-600">Event Details & Review</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(event.status)}>
              {event.status.replace('_', ' ')}
            </Badge>
            <Button
              variant="outline"
              onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
          </div>
        </div>

        {/* Admin Actions */}
        {event.status === 'pending_approval' && (
          <div className="flex space-x-3">
            <Button
              onClick={() => handleAdminAction('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Event
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAdminAction('request_info')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Information
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAdminAction('reject')}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Event
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="distances">Distances</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          <TabsTrigger value="organiser">Organiser</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Event Information
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddComment('overview')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Event Name</Label>
                  <p className="text-gray-900">{event.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="text-gray-900">{event.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Event Date</Label>
                    <p className="text-gray-900">{new Date(event.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Time</Label>
                    <p className="text-gray-900">{event.start_time}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Registration Deadline</Label>
                    <p className="text-gray-900">{event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Max Participants</Label>
                    <p className="text-gray-900">{event.max_participants || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Entry Fee</Label>
                    <p className="text-gray-900">R{event.entry_fee || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">License Fee</Label>
                    <p className="text-gray-900">R{event.temp_license_fee || 0}</p>
                  </div>
                </div>
                {event.license_details && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">License Details</Label>
                    <p className="text-gray-900">{event.license_details}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Image</CardTitle>
              </CardHeader>
              <CardContent>
                {event.primary_image_url ? (
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={event.primary_image_url}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Location Details
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddComment('location')}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Venue</Label>
                <p className="text-gray-900">{event.venue_name || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Address</Label>
                <p className="text-gray-900">{event.address || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">City</Label>
                  <p className="text-gray-900">{event.city}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Province</Label>
                  <p className="text-gray-900">{event.province}</p>
                </div>
              </div>
              
              {/* Location Comments */}
              {getSectionComments('location').length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-600">Comments</Label>
                  <div className="space-y-2">
                    {getSectionComments('location').map((comment) => (
                      <div key={comment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-900">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {comment.admin} • {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distances Tab */}
        <TabsContent value="distances">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Event Distances
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddComment('distances')}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.distances && event.distances.length > 0 ? (
                  event.distances.map((distance) => (
                    <div key={distance.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{distance.name}</h4>
                        <Badge variant="outline">{distance.distance_km} km</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Entry Fee</Label>
                          <p className="font-medium">R{distance.price}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Max Participants</Label>
                          <p className="font-medium">{distance.entry_limit || 'No limit'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Start Time</Label>
                          <p className="font-medium">{distance.start_time || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No distances configured for this event.</p>
                )}
              </div>
              
              {/* Distance Comments */}
              {getSectionComments('distances').length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-600">Comments</Label>
                  <div className="space-y-2">
                    {getSectionComments('distances').map((comment) => (
                      <div key={comment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-900">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {comment.admin} • {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merchandise Tab */}
        <TabsContent value="merchandise">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Event Merchandise
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddComment('merchandise')}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.merchandise && event.merchandise.length > 0 ? (
                  event.merchandise.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <Badge variant="outline">R{item.price}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description || 'No description'}</p>
                      {item.variations && item.variations.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Variations</Label>
                          <div className="space-y-2 mt-1">
                            {item.variations.map((variation) => (
                              <div key={variation.id} className="text-sm">
                                <span className="font-medium">{variation.variation_name}:</span>
                                <span className="ml-2 text-gray-600">
                                  {Array.isArray(variation.variation_options) 
                                    ? variation.variation_options.join(', ')
                                    : variation.variation_options}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No merchandise configured for this event.</p>
                )}
              </div>
              
              {/* Merchandise Comments */}
              {getSectionComments('merchandise').length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-600">Comments</Label>
                  <div className="space-y-2">
                    {getSectionComments('merchandise').map((comment) => (
                      <div key={comment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-900">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {comment.admin} • {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organiser Tab */}
        <TabsContent value="organiser">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Organiser Information
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddComment('organiser')}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comment
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-gray-900">{event.organiser_name || 'Not available'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900">{event.organiser_email || 'Not available'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-gray-900">{new Date(event.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-gray-900">{new Date(event.updated_at).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Organiser Comments */}
              {getSectionComments('organiser').length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-600">Comments</Label>
                  <div className="space-y-2">
                    {getSectionComments('organiser').map((comment) => (
                      <div key={comment.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-900">{comment.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by {comment.admin} • {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>All Comments & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{comment.section}</Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-900">{comment.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        by {comment.admin}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Add comments to specific sections to provide feedback to the organiser.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Action Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {adminAction === 'approve' ? 'Approve Event' : 
               adminAction === 'reject' ? 'Reject Event' : 
               'Request Information'}
            </DialogTitle>
            <DialogDescription>
              {adminAction === 'approve' ? 'This event will be published and visible to the public.' :
               adminAction === 'reject' ? 'This event will be cancelled and the organiser will be notified.' :
               'Send a message to the organiser requesting more information or changes.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
                className={
                  adminAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : adminAction === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
              >
                {adminAction === 'approve' ? 'Approve Event' : 
                 adminAction === 'reject' ? 'Reject Event' : 
                 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Modal */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Comment for {selectedSection}</DialogTitle>
            <DialogDescription>
              Provide feedback on the {selectedSection} section of this event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionComment">Comment</Label>
              <Textarea
                id="sectionComment"
                placeholder="Add your feedback or questions about this section..."
                value={sectionComment}
                onChange={(e) => setSectionComment(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitComment}>
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}