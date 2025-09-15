'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { participantRegistrationApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, 
  Plus, 
  Edit, 
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
  participant_first_name: string
  participant_last_name: string
  participant_email: string
  participant_mobile: string
  participant_date_of_birth: string
  participant_medical_aid?: string
  participant_medical_aid_number?: string
  emergency_contact_name: string
  emergency_contact_number: string
  created_at: string
  updated_at: string
}

export default function MembersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<SavedParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<SavedParticipant | null>(null)
  const [formData, setFormData] = useState({
    participant_first_name: '',
    participant_last_name: '',
    participant_email: '',
    participant_mobile: '',
    participant_date_of_birth: '',
    participant_medical_aid: '',
    participant_medical_aid_number: '',
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
      participant_first_name: participant.participant_first_name,
      participant_last_name: participant.participant_last_name,
      participant_email: participant.participant_email,
      participant_mobile: participant.participant_mobile,
      participant_date_of_birth: participant.participant_date_of_birth,
      participant_medical_aid: participant.participant_medical_aid || '',
      participant_medical_aid_number: participant.participant_medical_aid_number || '',
      emergency_contact_name: participant.emergency_contact_name,
      emergency_contact_number: participant.emergency_contact_number
    })
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (!editingParticipant) return
      
      const response = await participantRegistrationApi.updateSavedParticipant(editingParticipant.id, formData)
      
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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
          <Button>
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
                        {participant.participant_first_name} {participant.participant_last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Age {calculateAge(participant.participant_date_of_birth)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
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
                    <span>{participant.participant_email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{participant.participant_mobile}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(participant.participant_date_of_birth), 'MMM dd, yyyy')}</span>
                  </div>

                  {participant.participant_medical_aid && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span>{participant.participant_medical_aid}</span>
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
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.participant_first_name}
                onChange={(e) => setFormData({...formData, participant_first_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.participant_last_name}
                onChange={(e) => setFormData({...formData, participant_last_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.participant_email}
                onChange={(e) => setFormData({...formData, participant_email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={formData.participant_mobile}
                onChange={(e) => setFormData({...formData, participant_mobile: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.participant_date_of_birth}
                onChange={(e) => setFormData({...formData, participant_date_of_birth: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="medical_aid">Medical Aid</Label>
              <Input
                id="medical_aid"
                value={formData.participant_medical_aid}
                onChange={(e) => setFormData({...formData, participant_medical_aid: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="medical_aid_number">Medical Aid Number</Label>
              <Input
                id="medical_aid_number"
                value={formData.participant_medical_aid_number}
                onChange={(e) => setFormData({...formData, participant_medical_aid_number: e.target.value})}
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
    </div>
  )
}