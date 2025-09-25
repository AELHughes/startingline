'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EventAuditTrail from '@/components/events/event-audit-trail'
import { 
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
  MessageCircle,
  Edit,
  Send,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'

// Import the eventsApi back for now to avoid breaking the page
import { eventsApi } from '@/lib/api'

// Use the existing API service to fetch event details
const fetchEventDetails = async (eventId: string) => {
  const response = await eventsApi.getEventById(eventId)
  return response.data
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
  const [sectionComments, setSectionComments] = useState<{[key: string]: string}>({})
  const [showSubmitComments, setShowSubmitComments] = useState(false)
  const [submittedComments, setSubmittedComments] = useState<{[key: string]: string}>({})
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  // Fetch real event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventDetails(eventId),
    enabled: !!eventId
  })

  // Fetch admin comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['admin-comments', eventId],
    queryFn: () => eventsApi.getAdminComments(eventId),
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
      let status = ''
      let actionMessage = ''
      
      switch (adminAction) {
        case 'approve':
          status = 'published'
          actionMessage = 'Event approved and published successfully!'
          break
        case 'reject':
          status = 'cancelled'
          actionMessage = 'Event rejected successfully!'
          break
        case 'request_info':
          status = 'pending_approval'
          actionMessage = 'Information request sent to organiser successfully!'
          break
      }
      
      // Call the API to update event status
      await eventsApi.updateEventStatus(eventId, status, adminNote)
      
      // Close modal and show success message
      setShowAdminModal(false)
      setAdminNote('')
      alert(actionMessage)
      
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Failed to submit admin action:', error)
      alert('Failed to submit admin action. Please try again.')
    }
  }

  const handleAddComment = (section: string) => {
    setSelectedSection(section)
    setSectionComment(sectionComments[section] || '')
    setShowCommentModal(true)
  }

  const handleSubmitComment = async () => {
    try {
      if (!event || !sectionComment.trim()) return
      
      // Create admin comment via API
      await eventsApi.createAdminComment(event.id, selectedSection, sectionComment)
      
      // Update the section comment locally
      setSectionComments(prev => ({
        ...prev,
        [selectedSection]: sectionComment
      }))
      
      // Show submit comments button if any comments exist
      const hasComments = Object.values({...sectionComments, [selectedSection]: sectionComment}).some(comment => comment.trim() !== '')
      setShowSubmitComments(hasComments)
      
      setShowCommentModal(false)
      setSectionComment('')
      
      // Refresh the comments query
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Failed to add comment:', error)
      alert('Failed to add comment. Please try again.')
    }
  }

  const handleSubmitAllComments = async () => {
    try {
      if (!event) return
      
      // Submit all pending comments via API
      for (const [section, comment] of Object.entries(sectionComments)) {
        if (comment.trim()) {
          await eventsApi.createAdminComment(event.id, section, comment)
        }
      }
      
      // Move comments to submitted and clear current comments
      setSubmittedComments(prev => ({
        ...prev,
        ...sectionComments
      }))
      setSectionComments({})
      setShowSubmitComments(false)
      
      // Refresh the page to show updated comments
      window.location.reload()
      
      alert('Comments submitted to organiser successfully!')
    } catch (error) {
      console.error('Failed to submit comments:', error)
      alert('Failed to submit comments. Please try again.')
    }
  }

  const getSectionComments = (section: string) => {
    return comments.filter(comment => comment.section === section)
  }

  const handleEditSection = (section: string) => {
    setEditingSection(section)
    
    // Initialize form data based on section
    switch (section) {
      case 'overview':
        setEditFormData({
          name: event.name,
          category: event.category,
          event_type: event.event_type,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          start_time: event.start_time,
          registration_deadline: event.registration_deadline,
          max_participants: event.max_participants,
          entry_fee: event.entry_fee,
          license_required: event.license_required,
          temp_license_fee: event.temp_license_fee,
          license_details: event.license_details
        })
        break
        
      case 'location':
        setEditFormData({
          venue_name: event.venue_name,
          address: event.address,
          city: event.city,
          province: event.province
        })
        break
        
      case 'distances':
        setEditFormData({
          distances: event.distances || []
        })
        break
        
      case 'merchandise':
        setEditFormData({
          merchandise: event.merchandise || []
        })
        break
        
      default:
        setEditFormData({})
    }
  }

  const handleSaveSection = async (section: string) => {
    try {
      console.log('Saving section:', section, editFormData)
      
      // Call the real API to save the section
      await eventsApi.updateEventSection(eventId, section, editFormData)
      
      // Close the edit mode and clear form data
      setEditingSection(null)
      setEditFormData({})
      
      // Show success message
      alert(`${section} section updated successfully!`)
      
      // Refresh the event data to show the updated information
      // The useQuery will automatically refetch when the component re-renders
      window.location.reload()
    } catch (error) {
      console.error('Failed to save section:', error)
      alert(`Failed to update ${section} section. Please try again.`)
    }
  }

  const handleCancelEdit = () => {
    setEditingSection(null)
    setEditFormData({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
            <p className="text-gray-600">Review event details and provide feedback</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(event.status || 'draft')}>
              {(event.status || 'draft').replace('_', ' ')}
            </Badge>
            <Button
              variant="outline"
              onClick={() => window.open(`/events/${event.slug || event.id}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/events')}
            >
              Cancel
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

        {/* Submit Comments Button */}
        {showSubmitComments && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Comments Ready to Submit</h3>
                <p className="text-sm text-blue-700">You have comments for {Object.keys(sectionComments).filter(key => sectionComments[key].trim() !== '').length} section(s)</p>
              </div>
              <Button
                onClick={handleSubmitAllComments}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Comments to Organiser ({event.organiser_name || 'Organiser'})
              </Button>
            </div>
            </div>
          )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="distances">Distances</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          <TabsTrigger value="organiser">Organiser</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Event Information
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddComment('overview')}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Comment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditSection('overview')}
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === 'overview' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name" className="text-sm font-medium text-gray-600">Event Name</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-category" className="text-sm font-medium text-gray-600">Category</Label>
                        <Input
                          id="edit-category"
                          value={editFormData.category || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-event-type" className="text-sm font-medium text-gray-600">Event Type</Label>
                        <Select
                          value={editFormData.event_type || 'single'}
                          onValueChange={(value) => setEditFormData(prev => ({ ...prev, event_type: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Day</SelectItem>
                            <SelectItem value="multi">Multi-Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-description" className="text-sm font-medium text-gray-600">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-start-date" className="text-sm font-medium text-gray-600">Start Date</Label>
                        <Input
                          id="edit-start-date"
                          type="date"
                          value={editFormData.start_date ? editFormData.start_date.split('T')[0] : ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, start_date: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-end-date" className="text-sm font-medium text-gray-600">End Date</Label>
                        <Input
                          id="edit-end-date"
                          type="date"
                          value={editFormData.end_date ? editFormData.end_date.split('T')[0] : ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, end_date: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-start-time" className="text-sm font-medium text-gray-600">Start Time</Label>
                        <Input
                          id="edit-start-time"
                          type="time"
                          value={editFormData.start_time || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, start_time: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-registration-deadline" className="text-sm font-medium text-gray-600">Registration Deadline</Label>
                        <Input
                          id="edit-registration-deadline"
                          type="date"
                          value={editFormData.registration_deadline ? editFormData.registration_deadline.split('T')[0] : ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-license-fee" className="text-sm font-medium text-gray-600">License Fee</Label>
                        <Input
                          id="edit-license-fee"
                          type="number"
                          step="0.01"
                          value={editFormData.temp_license_fee || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, temp_license_fee: parseFloat(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-license-required" className="text-sm font-medium text-gray-600">License Required</Label>
                        <Select
                          value={editFormData.license_required ? 'true' : 'false'}
                          onValueChange={(value) => setEditFormData(prev => ({ ...prev, license_required: value === 'true' }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">No</SelectItem>
                            <SelectItem value="true">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-license-details" className="text-sm font-medium text-gray-600">License Details</Label>
                      <Input
                        id="edit-license-details"
                        value={editFormData.license_details || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, license_details: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveSection('overview')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Event Name</Label>
                      <p className="text-gray-900">{event.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Category</Label>
                        <p className="text-gray-900">{event.category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Event Type</Label>
                        <p className="text-gray-900">{event.event_type === 'multi' ? 'Multi-Day' : 'Single Day'}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      {event.description ? (
                        <div 
                          className="text-gray-900 prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg"
                          dangerouslySetInnerHTML={{ __html: event.description }}
                        />
                      ) : (
                        <p className="text-gray-900">No description provided</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                        <p className="text-gray-900">{new Date(event.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">End Date</Label>
                        <p className="text-gray-900">{event.end_date ? new Date(event.end_date).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Start Time</Label>
                        <p className="text-gray-900">{event.start_time}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Registration Deadline</Label>
                        <p className="text-gray-900">{event.registration_deadline ? new Date(event.registration_deadline).toLocaleDateString() : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Fee</Label>
                        <p className="text-gray-900">R{event.temp_license_fee || 0}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Required</Label>
                        <p className="text-gray-900">{event.license_required ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {event.license_details && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">License Details</Label>
                        <p className="text-gray-900">{event.license_details}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Overview Comments */}
                {sectionComments['overview'] && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-gray-600">Comments</Label>
                    <div className="bg-yellow-50 p-3 rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800">{sectionComments['overview']}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            by System Administrator • {new Date().toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddComment('overview')}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSectionComments(prev => {
                                const newComments = { ...prev }
                                delete newComments['overview']
                                const hasComments = Object.values(newComments).some(comment => comment.trim() !== '')
                                setShowSubmitComments(hasComments)
                                return newComments
                              })
                            }}
                            className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddComment('location')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSection('location')}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingSection === 'location' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-venue-name" className="text-sm font-medium text-gray-600">Venue</Label>
                    <Input
                      id="edit-venue-name"
                      value={editFormData.venue_name || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                <div>
                    <Label htmlFor="edit-address" className="text-sm font-medium text-gray-600">Address</Label>
                    <Textarea
                      id="edit-address"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-city" className="text-sm font-medium text-gray-600">City</Label>
                      <Input
                        id="edit-city"
                        value={editFormData.city || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1"
                      />
                </div>
                <div>
                      <Label htmlFor="edit-province" className="text-sm font-medium text-gray-600">Province</Label>
                      <Input
                        id="edit-province"
                        value={editFormData.province || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, province: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSaveSection('location')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
              
              {/* Location Comments */}
              {sectionComments['location'] && (
                <div className="mt-6">
                  <Label className="text-sm font-medium text-gray-600">Comments</Label>
                  <div className="bg-yellow-50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-gray-800">{sectionComments['location']}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          by System Administrator • {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddComment('location')}
                          className="h-6 px-2 text-xs"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSectionComments(prev => {
                              const newComments = { ...prev }
                              delete newComments['location']
                              const hasComments = Object.values(newComments).some(comment => comment.trim() !== '')
                              setShowSubmitComments(hasComments)
                              return newComments
                            })
                          }}
                          className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddComment('distances')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSection('distances')}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                </CardTitle>
              </CardHeader>
            <CardContent>
              {editingSection === 'distances' ? (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {editFormData.distances?.map((distance, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Distance {index + 1}
                          </h4>
                          {editFormData.distances.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newDistances = editFormData.distances.filter((_, i) => i !== index)
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`distance_${index}_name`} className="mb-2 font-medium">Distance Name *</Label>
                            <Input
                              id={`distance_${index}_name`}
                              value={distance.name || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], name: e.target.value }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="e.g., 5km Fun Run"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_distance`} className="mb-2 font-medium">Distance (km) *</Label>
                            <Input
                              id={`distance_${index}_distance`}
                              type="number"
                              min="0"
                              step="0.1"
                              value={distance.distance_km || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], distance_km: parseFloat(e.target.value) || 0 }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_price`} className="mb-2 font-medium">Price (R) *</Label>
                            <Input
                              id={`distance_${index}_price`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={distance.price || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], price: parseFloat(e.target.value) || 0 }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="0.00"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_min_age`} className="mb-2 font-medium">Minimum Age</Label>
                            <Input
                              id={`distance_${index}_min_age`}
                              type="number"
                              min="0"
                              value={distance.min_age || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], min_age: e.target.value ? parseInt(e.target.value) : undefined }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="No limit"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_entry_limit`} className="mb-2 font-medium">Entry Limit</Label>
                            <Input
                              id={`distance_${index}_entry_limit`}
                              type="number"
                              min="0"
                              value={distance.entry_limit || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], entry_limit: e.target.value ? parseInt(e.target.value) : undefined }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="No limit"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_start_time`} className="mb-2 font-medium">Start Time</Label>
                            <Input
                              id={`distance_${index}_start_time`}
                              type="time"
                              value={distance.start_time || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], start_time: e.target.value }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`distance_${index}_free_seniors`}
                              checked={distance.free_for_seniors || false}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], free_for_seniors: e.target.checked }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`distance_${index}_free_seniors`}>Free for seniors</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`distance_${index}_free_disability`}
                              checked={distance.free_for_disability || false}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], free_for_disability: e.target.checked }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={`distance_${index}_free_disability`}>Free for disability</Label>
                          </div>
                        </div>

                        {distance.free_for_seniors && (
                          <div className="mt-4">
                            <Label htmlFor={`distance_${index}_senior_age`} className="mb-2 font-medium">Senior Age Threshold</Label>
                            <Input
                              id={`distance_${index}_senior_age`}
                              type="number"
                              min="0"
                              value={distance.senior_age_threshold || ''}
                              onChange={(e) => {
                                const newDistances = [...editFormData.distances]
                                newDistances[index] = { ...newDistances[index], senior_age_threshold: e.target.value ? parseInt(e.target.value) : undefined }
                                setEditFormData(prev => ({ ...prev, distances: newDistances }))
                              }}
                              placeholder="65"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Add/Remove Distance Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newDistances = [...(editFormData.distances || [])]
                          newDistances.push({
                            name: '',
                            distance_km: '',
                            price: '',
                            min_age: '',
                            entry_limit: '',
                            start_time: '',
                            free_for_seniors: false,
                            free_for_disability: false,
                            senior_age_threshold: ''
                          })
                          setEditFormData(prev => ({ ...prev, distances: newDistances }))
                        }}
                        className="flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Distance
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveSection('distances')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.distances && event.distances.length > 0 ? (
                    event.distances.map((distance) => (
                      <div key={distance.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{distance.name}</h4>
                          <Badge variant="outline">{distance.distance_km} km</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-gray-600">Entry Fee</Label>
                            <p className="font-medium">R{distance.price}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Entry Limit</Label>
                            <p className="font-medium">{distance.entry_limit || 'No limit'}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Start Time</Label>
                            <p className="font-medium">{distance.start_time || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-gray-600">Min Age</Label>
                            <p className="font-medium">{distance.min_age || 'No limit'}</p>
                          </div>
                        </div>
                        {(distance.free_for_seniors || distance.free_for_disability) && (
                          <div className="mt-2 flex gap-2">
                            {distance.free_for_seniors && (
                              <Badge variant="secondary">Free for seniors ({distance.senior_age_threshold || 65}+)</Badge>
                            )}
                            {distance.free_for_disability && (
                              <Badge variant="secondary">Free for disability</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No distances configured for this event.</p>
                  )}
                  
                  {/* Distance Comments */}
                  {sectionComments['distances'] && (
                    <div className="mt-6">
                      <Label className="text-sm font-medium text-gray-600">Comments</Label>
                      <div className="bg-yellow-50 p-3 rounded-md text-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-800">{sectionComments['distances']}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              by System Administrator • {new Date().toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddComment('distances')}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSectionComments(prev => {
                                  const newComments = { ...prev }
                                  delete newComments['distances']
                                  const hasComments = Object.values(newComments).some(comment => comment.trim() !== '')
                                  setShowSubmitComments(hasComments)
                                  return newComments
                                })
                              }}
                              className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddComment('merchandise')}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Comment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSection('merchandise')}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingSection === 'merchandise' ? (
                  <div className="space-y-4">
                    <div className="space-y-6">
                      {editFormData.merchandise?.map((merch, merchIndex) => (
                        <Card key={merchIndex} className="relative">
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`merch_${merchIndex}_name`} className="mb-2 font-medium">Item Name *</Label>
                                <Input
                                  id={`merch_${merchIndex}_name`}
                                  value={merch.name || ''}
                                  onChange={(e) => {
                                    const newMerchandise = [...editFormData.merchandise]
                                    newMerchandise[merchIndex] = { ...newMerchandise[merchIndex], name: e.target.value }
                                    setEditFormData(prev => ({ ...prev, merchandise: newMerchandise }))
                                  }}
                                  placeholder="e.g., Event T-Shirt"
                                />
                              </div>

                              <div>
                                <Label htmlFor={`merch_${merchIndex}_price`} className="mb-2 font-medium">Price (R) *</Label>
                                <Input
                                  id={`merch_${merchIndex}_price`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={merch.price || merch.base_price || ''}
                                  onChange={(e) => {
                                    const newMerchandise = [...editFormData.merchandise]
                                    newMerchandise[merchIndex] = { 
                                      ...newMerchandise[merchIndex], 
                                      price: parseFloat(e.target.value) || 0,
                                      base_price: parseFloat(e.target.value) || 0 // Keep both for compatibility
                                    }
                                    setEditFormData(prev => ({ ...prev, merchandise: newMerchandise }))
                                  }}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label htmlFor={`merch_${merchIndex}_description`} className="mb-2 font-medium">Description</Label>
                              <Textarea
                                id={`merch_${merchIndex}_description`}
                                value={merch.description || ''}
                                onChange={(e) => {
                                  const newMerchandise = [...editFormData.merchandise]
                                  newMerchandise[merchIndex] = { ...newMerchandise[merchIndex], description: e.target.value }
                                  setEditFormData(prev => ({ ...prev, merchandise: newMerchandise }))
                                }}
                                placeholder="Describe the merchandise item..."
                                rows={3}
                              />
                            </div>

                            {/* Merchandise Image Preview */}
                            {merch.image_url && (
                              <div className="mt-4">
                                <Label className="mb-2 font-medium">Item Image</Label>
                                <div className="relative w-32 h-32">
                                  <img
                                    src={merch.image_url}
                                    alt="Merchandise"
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Variations Display */}
                            {merch.variations && merch.variations.length > 0 && (
                              <div className="mt-6 space-y-4">
                                <Label className="text-base font-medium">Variations</Label>
                                {merch.variations.map((variation, variationIndex) => (
                                  <Card key={variationIndex} className="bg-gray-50">
                                    <CardContent className="pt-4">
                                      <div className="mb-3">
                                        <Input
                                          value={variation.variation_name || ''}
                                          onChange={(e) => {
                                            const newMerchandise = [...editFormData.merchandise]
                                            newMerchandise[merchIndex].variations[variationIndex] = {
                                              ...newMerchandise[merchIndex].variations[variationIndex],
                                              variation_name: e.target.value
                                            }
                                            setEditFormData(prev => ({ ...prev, merchandise: newMerchandise }))
                                          }}
                                          placeholder="Variation name (e.g., Size, Color)"
                                          className="mb-2"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label className="text-sm">Options</Label>
                                        {Array.isArray(variation.variation_options) ? 
                                          variation.variation_options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center gap-2">
                                              <Input
                                                value={option}
                                                onChange={(e) => {
                                                  const newMerchandise = [...editFormData.merchandise]
                                                  const newOptions = [...newMerchandise[merchIndex].variations[variationIndex].variation_options]
                                                  newOptions[optionIndex] = e.target.value
                                                  newMerchandise[merchIndex].variations[variationIndex] = {
                                                    ...newMerchandise[merchIndex].variations[variationIndex],
                                                    variation_options: newOptions
                                                  }
                                                  setEditFormData(prev => ({ ...prev, merchandise: newMerchandise }))
                                                }}
                                                placeholder="Option value"
                                                className="flex-1"
                                              />
                                            </div>
                                          ))
                                        : (
                                          <div className="text-sm text-gray-600">
                                            {variation.variation_options}
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveSection('merchandise')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {event.merchandise && event.merchandise.length > 0 ? (
                      event.merchandise.map((item) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex gap-4">
                            {/* Image */}
                            {item.image_url && (
                              <div className="flex-shrink-0">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />
                              </div>
                            )}
                            
                            {/* Details */}
                            <div className="flex-grow">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.description || 'No description'}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <Badge variant="outline" className="text-base font-medium mb-2">
                                    R {Number((item as any).price || (item as any).base_price || 0).toFixed(2)}
                                  </Badge>
                                  {/* Stock is now tracked per variation option - see details below */}
                                  <Badge variant="secondary" className="text-sm">
                                    Stock per variation
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Variations */}
                              {item.variations && item.variations.length > 0 && (
                                <div className="mt-4">
                                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Available Options</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {item.variations.map((variation) => (
                                      <div key={variation.id} className="bg-gray-50 rounded-lg p-2">
                                        <span className="text-sm font-medium text-gray-700">{variation.variation_name}: </span>
                                        <div className="space-y-1">
                                          {Array.isArray(variation.variation_options) 
                                            ? variation.variation_options.map((option: any, optIndex: number) => {
                                                if (typeof option === 'object' && option.value !== undefined) {
                                                  const stockText = option.stock !== undefined 
                                                    ? `${option.stock} available` 
                                                    : option.current_stock !== undefined 
                                                    ? `${option.current_stock} available`
                                                    : 'Stock N/A'
                                                  return (
                                                    <div key={optIndex} className="flex justify-between items-center py-1 px-2 bg-white rounded border text-sm">
                                                      <span className="font-medium">{option.value}</span>
                                                      <span className="text-green-600">{stockText}</span>
                                                    </div>
                                                  )
                                                }
                                                return (
                                                  <div key={optIndex} className="py-1 px-2 bg-white rounded border text-sm">
                                                    {String(option)}
                                                  </div>
                                                )
                                              })
                                            : (
                                              <div className="py-1 px-2 bg-white rounded border text-sm">
                                                {String(variation.variation_options)}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No merchandise configured for this event.</p>
                    )}
                    
                    {/* Merchandise Comments */}
                    {sectionComments['merchandise'] && (
                      <div className="mt-6">
                        <Label className="text-sm font-medium text-gray-600">Comments</Label>
                        <div className="bg-yellow-50 p-3 rounded-md text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-gray-800">{sectionComments['merchandise']}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                by System Administrator • {new Date().toLocaleString()}
                              </p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddComment('merchandise')}
                                className="h-6 px-2 text-xs"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSectionComments(prev => {
                                    const newComments = { ...prev }
                                    delete newComments['merchandise']
                                    const hasComments = Object.values(newComments).some(comment => comment.trim() !== '')
                                    setShowSubmitComments(hasComments)
                                    return newComments
                                  })
                                }}
                                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organiser Tab */}
        <TabsContent value="organiser">
          <Card>
            <CardHeader>
              <CardTitle>
                Organiser Information
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
              {/* Current Comments */}
              {Object.keys(sectionComments).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Current Comments (Not Yet Submitted)</h3>
                  <div className="space-y-4">
                    {Object.entries(sectionComments).map(([section, comment]) => (
                      <div key={section} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{section}</Badge>
                          <span className="text-sm text-gray-500">
                            Draft
                          </span>
                        </div>
                        <p className="text-gray-900">{comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          by System Administrator • {new Date().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Comments */}
              {Object.keys(submittedComments).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Submitted Comments</h3>
                  <div className="space-y-4">
                    {Object.entries(submittedComments).map(([section, comment]) => (
                      <div key={section} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">{section}</Badge>
                          <span className="text-sm text-gray-500">
                            Submitted
                          </span>
                        </div>
                        <p className="text-gray-900">{comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          by System Administrator • {new Date().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Comments */}
              {comments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Comments</h3>
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
                </div>
              )}

              {/* No Comments State */}
              {Object.keys(sectionComments).length === 0 && Object.keys(submittedComments).length === 0 && comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                  <p className="text-gray-600">Add comments to specific sections to provide feedback to the organiser.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Event History & Change Requests</CardTitle>
              <CardDescription>
                View all changes, requests, and activity for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventAuditTrail eventId={event.id} />
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
            <DialogTitle>
              {sectionComments[selectedSection] ? 'Edit Comment' : 'Add Comment'} for {selectedSection}
            </DialogTitle>
            <DialogDescription>
              Provide feedback or request changes for the {selectedSection} section of this event.
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
                {sectionComments[selectedSection] ? 'Update Comment' : 'Add Comment'}
              </Button>
        </div>
      </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}