'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { participantRegistrationApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Edit,
  Eye,
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  Heart,
  AlertCircle,
  User
} from 'lucide-react'
import { format } from 'date-fns'

interface SavedParticipant {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile: string
  date_of_birth: string
  medical_aid_name: string | null
  medical_aid_number: string | null
  emergency_contact_name: string
  emergency_contact_number: string
  created_at: string
}

interface SaveParticipantInput {
  first_name: string
  last_name: string
  email: string
  mobile: string
  date_of_birth: string
  medical_aid_name: string | null
  medical_aid_number: string | null
  emergency_contact_name: string
  emergency_contact_number: string
}

export default function MembersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingParticipant, setViewingParticipant] = useState<SavedParticipant | null>(null)
  const [editingParticipant, setEditingParticipant] = useState<SavedParticipant | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    date_of_birth: '',
    medical_aid_name: '',
    medical_aid_number: '',
    emergency_contact_name: '',
    emergency_contact_number: ''
  })

  useEffect(() => {
    if (user) {
      if (user.role !== 'participant') {
        router.push('/dashboard')
      } else {
        fetchParticipants()
      }
    } else {
      setLoading(false)
    }
  }, [user, router])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching saved participants...')
      console.log('🔍 Current user:', user)
      console.log('🔍 Auth token:', localStorage.getItem('auth_token'))
      
      const response = await participantRegistrationApi.getSavedParticipants()
      console.log('🔍 API response:', response)
      
      if (response.success && response.data) {
        console.log('✅ Participants loaded:', response.data)
        console.log('🔍 First participant sample:', response.data[0])
        console.log('🔍 Participant fields:', Object.keys(response.data[0]))
        console.log('🔍 Email field:', response.data[0].participant_email)
        console.log('🔍 Mobile field:', response.data[0].participant_mobile)
        console.log('🔍 DOB field:', response.data[0].participant_date_of_birth)
        setParticipants(response.data)
      } else {
        console.error('❌ Failed to load participants:', response.error)
        setError(response.error || 'Failed to load participants')
      }
    } catch (error) {
      console.error('❌ Error fetching participants:', error)
      setError('Failed to load participants')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (participant: SavedParticipant) => {
    setEditingParticipant(participant)
    setFormData({
      first_name: participant.first_name,
      last_name: participant.last_name,
      email: participant.email,
      mobile: participant.mobile,
      date_of_birth: participant.date_of_birth,
      medical_aid_name: participant.medical_aid_name || '',
      medical_aid_number: participant.medical_aid_number || '',
      emergency_contact_name: participant.emergency_contact_name,
      emergency_contact_number: participant.emergency_contact_number
    })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      console.log('🔍 Saving member with data:', formData)
      console.log('🔍 Current user:', user)
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.mobile) {
        alert('Please fill in all required fields')
        return
      }
      
      // Use form data directly since it already matches backend field names
      const mappedData = {
        ...formData
      }
      
      const response = editingParticipant
        ? await participantRegistrationApi.updateSavedParticipant(editingParticipant.id, formData as SaveParticipantInput)
        : await participantRegistrationApi.saveParticipant(formData as SaveParticipantInput)
      
      if (response.success) {
        setIsEditDialogOpen(false)
        setEditingParticipant(null)
        fetchParticipants() // Refresh the list
      } else {
        alert(response.error || 'Failed to save participant')
      }
    } catch (error) {
      console.error('Error saving participant:', error)
      alert('Failed to save participant')
    }
  }

  const handleDelete = async (participantId: string) => {
    if (confirm('Are you sure you want to delete this participant?')) {
      try {
        const response = await participantRegistrationApi.deleteSavedParticipant(participantId)
        
        if (response.success) {
          fetchParticipants() // Refresh the list
        } else {
          alert(response.error || 'Failed to delete participant')
        }
      } catch (error) {
        console.error('Error deleting participant:', error)
        alert('Failed to delete participant')
      }
    }
  }

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'N/A'
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        return 'N/A'
      }
      
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch (error) {
      return 'N/A'
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your saved participants.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Members</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchParticipants}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Members</h1>
            <p className="text-gray-600">Manage your saved participants for quick registration</p>
          </div>
          <Button onClick={() => {
            setEditingParticipant(null)
            setFormData({
              first_name: '',
              last_name: '',
              email: '',
              mobile: '',
              date_of_birth: '',
              medical_aid_name: '',
              medical_aid_number: '',
              emergency_contact_name: '',
              emergency_contact_number: ''
            })
            setIsEditDialogOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.length > 0 ? (
          participants.map((participant) => (
            <Card key={participant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {participant.first_name} {participant.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {calculateAge(participant.date_of_birth) === 'N/A' ? 
                          'Age not provided' : 
                          `Age ${calculateAge(participant.date_of_birth)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔍 Viewing participant:', participant)
                        console.log('🔍 Participant fields:', Object.keys(participant))
                        console.log('🔍 Participant email:', participant.email, participant.participant_email)
                        console.log('🔍 Participant date:', participant.date_of_birth, participant.participant_date_of_birth)
                        setViewingParticipant(participant)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(participant)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(participant.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{participant.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{participant.mobile || 'Not provided'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {participant.date_of_birth ? 
                        format(new Date(participant.date_of_birth), 'MMM dd, yyyy') 
                        : 'Not provided'}
                    </span>
                  </div>

                  {participant.medical_aid_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span>
                        {participant.medical_aid_name}
                        {participant.medical_aid_number && ` - ${participant.medical_aid_number}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Emergency: {participant.emergency_contact_name} ({participant.emergency_contact_number})
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Members</h3>
            <p className="text-gray-600 mb-4">Add participants to your members list for quick registration.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Member
            </Button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParticipant ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="medical_aid">Medical Aid</Label>
              <Input
                id="medical_aid"
                value={formData.medical_aid_name || ''}
                onChange={(e) => setFormData({...formData, medical_aid_name: e.target.value || null})}
              />
            </div>
            <div>
              <Label htmlFor="medical_aid_number">Medical Aid Number</Label>
              <Input
                id="medical_aid_number"
                value={formData.medical_aid_number || ''}
                onChange={(e) => setFormData({...formData, medical_aid_number: e.target.value || null})}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
              <Input
                id="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={(e) => setFormData({...formData, emergency_contact_number: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6 p-2">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    {viewingParticipant?.first_name} {viewingParticipant?.last_name}
                  </h2>
                  <p className="text-gray-600">
                    {calculateAge(viewingParticipant?.date_of_birth || '') === 'N/A' ? 
                      'Age not provided' : 
                      `Age ${calculateAge(viewingParticipant?.date_of_birth || '')}`
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{viewingParticipant?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{viewingParticipant?.mobile || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        {viewingParticipant?.date_of_birth ? 
                          format(new Date(viewingParticipant.date_of_birth), 'MMM dd, yyyy') 
                          : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Medical Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      <span>
                        {viewingParticipant?.medical_aid_name ? 
                          `${viewingParticipant.medical_aid_name}${viewingParticipant.medical_aid_number ? ` - ${viewingParticipant.medical_aid_number}` : ''}` 
                          : 'No medical aid provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Emergency Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{viewingParticipant?.emergency_contact_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{viewingParticipant?.emergency_contact_number}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}