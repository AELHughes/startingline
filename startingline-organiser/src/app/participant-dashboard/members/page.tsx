'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { participantRegistrationApi, UserLicense, SportType } from '@/lib/api'
import { MobileInput } from '@/components/ui/mobile-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
  User,
  CheckCircle,
  Award,
  Building
} from 'lucide-react'
import { format } from 'date-fns'
import { IdNumberInput } from '@/components/ui/id-number-input'
import { IdValidationResult } from '@/utils/idValidation'

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
  id_document_type?: 'sa_id' | 'passport'
  id_document_masked?: string
  gender?: 'male' | 'female'
  citizenship_status?: 'citizen' | 'permanent_resident'
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
  id_document_number?: string
  id_document_type?: 'sa_id' | 'passport'
  gender?: 'male' | 'female'
  citizenship_status?: 'citizen' | 'permanent_resident'
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
  const [formData, setFormData] = useState<SaveParticipantInput>({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    date_of_birth: '',
    medical_aid_name: null,
    medical_aid_number: null,
    emergency_contact_name: '',
    emergency_contact_number: '',
    id_document_number: '',
    id_document_type: undefined,
    gender: undefined,
    citizenship_status: undefined
  })

  // License management state
  const [memberLicenses, setMemberLicenses] = useState<UserLicense[]>([])
  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
  const [editingLicense, setEditingLicense] = useState<UserLicense | null>(null)
  const [licenseFormData, setLicenseFormData] = useState({
    sport_type: '',
    license_number: '',
    license_authority: '',
    issue_date: '',
    expiry_date: ''
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
        console.log('🔍 Email field:', response.data[0].email)
        console.log('🔍 Mobile field:', response.data[0].mobile)
        console.log('🔍 DOB field:', response.data[0].date_of_birth)
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

  const handleEdit = async (participant: SavedParticipant) => {
    setEditingParticipant(participant)
    
    // Fetch the participant data with unmasked ID for editing
    try {
      const response = await participantRegistrationApi.getSavedParticipantForEdit(participant.id)
      
      if (response.success && response.data) {
        setFormData({
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          email: response.data.email,
          mobile: response.data.mobile,
          date_of_birth: response.data.date_of_birth,
          medical_aid_name: response.data.medical_aid_name || '',
          medical_aid_number: response.data.medical_aid_number || '',
          emergency_contact_name: response.data.emergency_contact_name,
          emergency_contact_number: response.data.emergency_contact_number,
          // Now includes unmasked ID for editing
          id_document_number: response.data.id_document_number || '',
          id_document_type: response.data.id_document_type,
          gender: response.data.gender,
          citizenship_status: response.data.citizenship_status
        })
      } else {
        // Fallback to basic data without ID
        setFormData({
          first_name: participant.first_name,
          last_name: participant.last_name,
          email: participant.email,
          mobile: participant.mobile,
          date_of_birth: participant.date_of_birth,
          medical_aid_name: participant.medical_aid_name || '',
          medical_aid_number: participant.medical_aid_number || '',
          emergency_contact_name: participant.emergency_contact_name,
          emergency_contact_number: participant.emergency_contact_number,
          id_document_number: '',
          id_document_type: participant.id_document_type,
          gender: participant.gender,
          citizenship_status: participant.citizenship_status
        })
        console.error('Failed to load participant for editing:', response.error)
      }
    } catch (error) {
      console.error('Error loading participant for editing:', error)
      // Fallback to basic data
      setFormData({
        first_name: participant.first_name,
        last_name: participant.last_name,
        email: participant.email,
        mobile: participant.mobile,
        date_of_birth: participant.date_of_birth,
        medical_aid_name: participant.medical_aid_name || '',
        medical_aid_number: participant.medical_aid_number || '',
        emergency_contact_name: participant.emergency_contact_name,
        emergency_contact_number: participant.emergency_contact_number,
        id_document_number: '',
        id_document_type: participant.id_document_type,
        gender: participant.gender,
        citizenship_status: participant.citizenship_status
      })
    }
    
    // Fetch licenses and sport types when editing
    await fetchMemberLicenses(participant.id)
    await fetchSportTypes()
    
    setIsEditDialogOpen(true)
  }

  // License management functions
  const fetchSportTypes = async () => {
    try {
      const response = await participantRegistrationApi.getSportTypes()
      if (response.success && response.data) {
        setSportTypes(response.data)
      }
    } catch (error) {
      console.error('Error fetching sport types:', error)
    }
  }

  const fetchMemberLicenses = async (participantId: string) => {
    try {
      const response = await participantRegistrationApi.getMemberLicenses(participantId)
      if (response.success && response.data) {
        setMemberLicenses(response.data)
      } else {
        setMemberLicenses([])
      }
    } catch (error) {
      console.error('Error fetching member licenses:', error)
      setMemberLicenses([])
    }
  }

  const handleAddLicense = () => {
    setEditingLicense(null)
    setLicenseFormData({
      sport_type: '',
      license_number: '',
      license_authority: '',
      issue_date: '',
      expiry_date: ''
    })
    setIsLicenseDialogOpen(true)
  }

  const handleEditLicense = (license: UserLicense) => {
    setEditingLicense(license)
    setLicenseFormData({
      sport_type: license.sport_type,
      license_number: license.license_number,
      license_authority: license.license_authority || '',
      issue_date: license.issue_date || '',
      expiry_date: license.expiry_date
    })
    setIsLicenseDialogOpen(true)
  }

  const handleSaveLicense = async () => {
    if (!editingParticipant) return

    try {
      if (editingLicense) {
        // Update existing license
        const response = await participantRegistrationApi.updateUserLicense(editingLicense.id, licenseFormData)
        if (response.success) {
          await fetchMemberLicenses(editingParticipant.id)
          setIsLicenseDialogOpen(false)
        } else {
          setError(response.error || 'Failed to update license')
        }
      } else {
        // Create new license
        const response = await participantRegistrationApi.createMemberLicense(editingParticipant.id, licenseFormData)
        if (response.success) {
          await fetchMemberLicenses(editingParticipant.id)
          setIsLicenseDialogOpen(false)
        } else {
          setError(response.error || 'Failed to create license')
        }
      }
    } catch (error) {
      console.error('Error saving license:', error)
      setError('Failed to save license')
    }
  }

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm('Are you sure you want to delete this license?')) return
    if (!editingParticipant) return

    try {
      const response = await participantRegistrationApi.deleteUserLicense(licenseId)
      if (response.success) {
        await fetchMemberLicenses(editingParticipant.id)
      } else {
        setError(response.error || 'Failed to delete license')
      }
    } catch (error) {
      console.error('Error deleting license:', error)
      setError('Failed to delete license')
    }
  }

  const isLicenseExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
    return expiry <= thirtyDaysFromNow && expiry >= today
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
              medical_aid_name: null,
              medical_aid_number: null,
              emergency_contact_name: '',
              emergency_contact_number: '',
              id_document_number: '',
              id_document_type: undefined,
              gender: undefined,
              citizenship_status: undefined
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
        console.log('🔍 Participant email:', participant.email)
        console.log('🔍 Participant date:', participant.date_of_birth)
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

                  {participant.id_document_masked && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-mono">
                        {participant.id_document_masked}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {participant.id_document_type === 'sa_id' ? 'SA ID' : 'Passport'}
                      </span>
                      {participant.gender && (
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-700">
                          {participant.gender === 'male' ? 'Male' : 'Female'}
                        </span>
                      )}
                      {participant.citizenship_status && (
                        <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                          {participant.citizenship_status === 'citizen' ? 'SA Citizen' : 'Permanent Resident'}
                        </span>
                      )}
                    </div>
                  )}

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
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-semibold">
                {editingParticipant ? 'Edit Member' : 'Add New Member'}
              </DialogTitle>
              <p className="text-gray-600">
                {editingParticipant ? 'Update member information below' : 'Add a new member to your saved participants'}
              </p>
            </DialogHeader>
          
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              {/* Name Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="h-11"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="h-11"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth" className="text-sm font-medium">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>

              {/* ID Number Section - Full Width */}
              <div className="space-y-2">
                <IdNumberInput
                  value={formData.id_document_number || ''}
                  onChange={(value) => setFormData({...formData, id_document_number: value})}
                  onValidationResult={(result: IdValidationResult) => {
                    setFormData(prev => ({
                      ...prev,
                      id_document_type: result.type === 'unknown' ? undefined : result.type,
                      gender: result.gender,
                      citizenship_status: result.citizenship
                    }))
                  }}
                  onDateOfBirthExtracted={(dateOfBirth) => {
                    setFormData(prev => ({...prev, date_of_birth: dateOfBirth}))
                  }}
                  label="ID Number / Passport"
                  required={false}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-11"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <MobileInput
                    id="mobile"
                    label="Mobile Number"
                    value={formData.mobile}
                    onChange={(value) => setFormData({...formData, mobile: value})}
                    required
                    showValidation={true}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="bg-green-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medical_aid" className="text-sm font-medium">Medical Aid Provider</Label>
                  <Input
                    id="medical_aid"
                    value={formData.medical_aid_name || ''}
                    onChange={(e) => setFormData({...formData, medical_aid_name: e.target.value || null})}
                    className="h-11"
                    placeholder="Enter medical aid provider"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medical_aid_number" className="text-sm font-medium">Medical Aid Number</Label>
                  <Input
                    id="medical_aid_number"
                    value={formData.medical_aid_number || ''}
                    onChange={(e) => setFormData({...formData, medical_aid_number: e.target.value || null})}
                    className="h-11"
                    placeholder="Enter medical aid number"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-orange-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name" className="text-sm font-medium">Emergency Contact Name *</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    className="h-11"
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_number" className="text-sm font-medium">Emergency Contact Number *</Label>
                  <Input
                    id="emergency_contact_number"
                    value={formData.emergency_contact_number}
                    onChange={(e) => setFormData({...formData, emergency_contact_number: e.target.value})}
                    className="h-11"
                    placeholder="Enter emergency contact number"
                  />
                </div>
              </div>
            </div>

            {/* Licenses Section */}
            <div className="bg-purple-50 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Sport Licenses</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLicense}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add License
                </Button>
              </div>
              
              {memberLicenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No licenses added yet</p>
                  <p className="text-sm">Add sport licenses for event participation</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memberLicenses.map((license) => {
                    const expired = isLicenseExpired(license.expiry_date)
                    const expiringSoon = isLicenseExpiringSoon(license.expiry_date)
                    const sportType = sportTypes.find(st => st.value === license.sport_type)
                    
                    return (
                      <div
                        key={license.id}
                        className={`p-4 rounded-lg border-2 ${
                          expired ? 'border-red-200 bg-red-50' : 
                          expiringSoon ? 'border-orange-200 bg-orange-50' : 
                          'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {sportType?.label || license.sport_type}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={license.is_active ? "default" : "secondary"} className="text-xs">
                                {license.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {expired && (
                                <Badge variant="destructive" className="text-xs">Expired</Badge>
                              )}
                              {expiringSoon && !expired && (
                                <Badge variant="outline" className="border-orange-500 text-orange-700 text-xs">
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLicense(license)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLicense(license.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Award className="w-3 h-3 text-gray-500" />
                            <span className="font-mono">{license.license_number}</span>
                          </div>
                          
                          {license.license_authority && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building className="w-3 h-3 text-gray-500" />
                              <span>{license.license_authority}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span>Expires: {format(new Date(license.expiry_date), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleSave} className="px-6">
                {editingParticipant ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto p-0">
          <div className="p-6">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-2xl font-semibold">
                Member Details
              </DialogTitle>
              <p className="text-gray-600">
                View member information
              </p>
            </DialogHeader>
          
            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                {/* Personal Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">First Name</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.first_name || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Name</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.last_name || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.date_of_birth ? 
                        new Date(viewingParticipant.date_of_birth).toLocaleDateString('en-ZA', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        }) 
                        : 'Not provided'}
                      {viewingParticipant?.date_of_birth && (
                        <span className="ml-2 text-sm text-gray-500">
                          (Age {calculateAge(viewingParticipant.date_of_birth)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ID Number Section - Full Width */}
                {viewingParticipant?.id_document_masked && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">ID Number / Passport</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center justify-between">
                      <span className="font-mono text-gray-900">{viewingParticipant.id_document_masked}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    {/* Display ID information badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {viewingParticipant.id_document_type && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {viewingParticipant.id_document_type === 'sa_id' ? 'SA ID Number' : 'Passport'}
                        </Badge>
                      )}
                      {viewingParticipant.gender && (
                        <Badge variant="outline">
                          {viewingParticipant.gender === 'male' ? 'Male' : 'Female'}
                        </Badge>
                      )}
                      {viewingParticipant.citizenship_status && (
                        <Badge variant="outline">
                          {viewingParticipant.citizenship_status === 'citizen' ? 'SA Citizen' : 'Permanent Resident'}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information Section */}
              <div className="bg-blue-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email Address</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.email || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mobile Number</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.mobile || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="bg-green-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Medical Aid Provider</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.medical_aid_name || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Medical Aid Number</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.medical_aid_number || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-orange-50 p-6 rounded-lg space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Emergency Contact Name</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.emergency_contact_name || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Emergency Contact Number</Label>
                    <div className="h-11 px-3 py-2 bg-white border border-gray-200 rounded-md flex items-center text-gray-900">
                      {viewingParticipant?.emergency_contact_number || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="px-6">
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                if (viewingParticipant) {
                  handleEdit(viewingParticipant)
                }
              }} className="px-6">
                Edit Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* License Add/Edit Dialog */}
      <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLicense ? 'Edit License' : 'Add New License'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license_sport_type">Sport Type *</Label>
              <Select
                value={licenseFormData.sport_type}
                onValueChange={(value) => setLicenseFormData({...licenseFormData, sport_type: value})}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select sport type" />
                </SelectTrigger>
                <SelectContent>
                  {sportTypes.map((sportType) => (
                    <SelectItem key={sportType.value} value={sportType.value}>
                      {sportType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                value={licenseFormData.license_number}
                onChange={(e) => setLicenseFormData({...licenseFormData, license_number: e.target.value})}
                placeholder="Enter license number"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_authority">License Authority</Label>
              <Input
                id="license_authority"
                value={licenseFormData.license_authority}
                onChange={(e) => setLicenseFormData({...licenseFormData, license_authority: e.target.value})}
                placeholder="e.g., Athletics South Africa"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_issue_date">Issue Date</Label>
              <Input
                id="license_issue_date"
                type="date"
                value={licenseFormData.issue_date}
                onChange={(e) => setLicenseFormData({...licenseFormData, issue_date: e.target.value})}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry_date">Expiry Date *</Label>
              <Input
                id="license_expiry_date"
                type="date"
                value={licenseFormData.expiry_date}
                onChange={(e) => setLicenseFormData({...licenseFormData, expiry_date: e.target.value})}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsLicenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLicense}>
              {editingLicense ? 'Update License' : 'Add License'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}