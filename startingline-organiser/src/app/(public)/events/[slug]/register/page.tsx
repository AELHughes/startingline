'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { participantRegistrationApi, type RegistrationDetails, type ParticipantData, type OrderData, type SavedParticipant } from '@/lib/api'
import { Button } from '@/components/ui/button'
import SavedParticipantsModal from '@/components/events/saved-participants-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Package, 
  Plus, 
  X, 
  Copy, 
  User,
  Phone,
  Mail,
  Heart,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

interface DistanceSelection {
  distance_id: string
  distance_name: string
  price: number
  quantity: number
  min_age?: number
}

interface ParticipantFormData extends ParticipantData {
  distance_id: string
  distance_name: string
  price: number
  min_age?: number
  ageError?: string
  firstNameError?: string
  lastNameError?: string
  emailError?: string
  mobileError?: string
  dateOfBirthError?: string
  emergencyContactNameError?: string
  emergencyContactNumberError?: string
}

// Custom Password Input Component
interface PasswordInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  showPassword: boolean
  onToggleVisibility: () => void
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  showPassword,
  onToggleVisibility
}) => {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="pr-10"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
        onClick={onToggleVisibility}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        )}
      </button>
    </div>
  )
}

export default function EventRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, updateAuthState } = useAuth()
  const slug = params.slug as string

  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [modalError, setModalError] = useState<string>('')
  const [savedParticipants, setSavedParticipants] = useState<SavedParticipant[]>([])
  const [participantAllocations, setParticipantAllocations] = useState<Array<{ participantId: string, participantIndex: number }>>([])
  
  // Registration flow state
  const [currentStep, setCurrentStep] = useState<'distances' | 'account' | 'participants' | 'checkout'>('distances')
  const [distanceSelections, setDistanceSelections] = useState<DistanceSelection[]>([])
  const [participantForms, setParticipantForms] = useState<ParticipantFormData[]>([])
  const [orderData, setOrderData] = useState<Partial<OrderData>>({})
  const [submitting, setSubmitting] = useState(false)
  
  // Account holder state
  const [accountHolderOption, setAccountHolderOption] = useState<'login' | 'new'>('new')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [accountHolderForm, setAccountHolderForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    company: '',
    address: '',
    password: '',
    confirm_password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showAccountPassword, setShowAccountPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchRegistrationDetails()
      if (user) {
        fetchSavedParticipants()
      }
    }
  }, [slug, user])

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true)
      // First get the event by slug to get the ID
      const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/events/slug/${slug}`)
      const eventResult = await eventResponse.json()
      
      if (!eventResult.success) {
        throw new Error('Event not found')
      }

      const eventId = eventResult.data.id
      const response = await participantRegistrationApi.getRegistrationDetails(eventId)
      
      if (response.success && response.data) {
        setRegistrationDetails(response.data)
        // Initialize order data with event info
        setOrderData({
          event_id: eventId,
          account_holder_first_name: user?.first_name || '',
          account_holder_last_name: user?.last_name || '',
          account_holder_email: user?.email || '',
          account_holder_mobile: user?.phone || '',
          account_holder_address: user?.company_address || '',
          emergency_contact_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
          emergency_contact_number: user?.phone || ''
        })
      } else {
        setError(response.error || 'Failed to load registration details')
      }
    } catch (error) {
      console.error('Error fetching registration details:', error)
      setError('Failed to load registration details')
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedParticipants = async () => {
    if (!user) return
    
    try {
      const response = await participantRegistrationApi.getSavedParticipants()
      if (response.success && response.data) {
        setSavedParticipants(response.data)
      }
    } catch (error) {
      console.error('Error fetching saved participants:', error)
    }
  }

  const handleDistanceQuantityChange = (distanceId: string, quantity: number) => {
    if (quantity === 0) {
      setDistanceSelections(prev => prev.filter(d => d.distance_id !== distanceId))
    } else {
      const distance = registrationDetails?.event.distances.find(d => d.id === distanceId)
      if (distance) {
        setDistanceSelections(prev => {
          const existing = prev.find(d => d.distance_id === distanceId)
          if (existing) {
            return prev.map(d => 
              d.distance_id === distanceId 
                ? { ...d, quantity }
                : d
            )
          } else {
            return [...prev, {
              distance_id: distanceId,
              distance_name: distance.name,
              price: distance.price,
              quantity,
              min_age: distance.min_age
            }]
          }
        })
      }
    }
  }

  const proceedToAccount = () => {
    if (distanceSelections.length === 0) {
      setError('Please select at least one distance')
      return
    }
    setCurrentStep('account')
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginError('')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      const data = await response.json()
      
      if (data.success && data.data) {
        const { user: userData, token } = data.data
        
        // Update auth context and store auth data
        updateAuthState(userData, token)
        
        // Populate account holder form with user data
        setAccountHolderForm({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          mobile: userData.phone || '',
          company: userData.company_name || '',
          address: userData.company_address || '',
          password: '',
          confirm_password: ''
        })
        
        // Update order data
        setOrderData(prev => ({
          ...prev,
          account_holder_first_name: userData.first_name || '',
          account_holder_last_name: userData.last_name || '',
          account_holder_email: userData.email || '',
          account_holder_mobile: userData.phone || '',
          account_holder_company: userData.company_name || '',
          account_holder_address: userData.company_address || '',
          emergency_contact_name: userData.first_name ? `${userData.first_name} ${userData.last_name}` : '',
          emergency_contact_number: userData.phone || ''
        }))
        
        // Fetch saved participants for logged in user
        fetchSavedParticipants()
        
        // Stay on the current page and show success message
        setLoginError('')
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const validateAge = (dateOfBirth: string, minAge?: number): string | null => {
    console.log('🔍 validateAge called with:', { dateOfBirth, minAge })
    
    if (!dateOfBirth) return null
    
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    
    // Set both dates to start of day for accurate comparison
    birthDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    
    console.log('🔍 Date comparison:', {
      birthDate: birthDate.toISOString(),
      today: today.toISOString(),
      birthDateGreater: birthDate > today
    })
    
    // Check if date of birth is in the future
    if (birthDate > today) {
      console.log('🔍 Future date detected')
      return 'Date of birth cannot be in the future'
    }
    
    // Check if date of birth is too far in the past (reasonable limit)
    const maxAge = 120
    const maxBirthDate = new Date(today)
    maxBirthDate.setFullYear(today.getFullYear() - maxAge)
    if (birthDate < maxBirthDate) {
      console.log('🔍 Date too far in past')
      return 'Please enter a valid date of birth'
    }
    
    if (!minAge) {
      console.log('🔍 No min age specified')
      return null
    }
    
    // Calculate age more precisely
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    console.log('🔍 Age calculation:', { 
      age,
      minAge,
      ageLessThanMin: age < minAge,
      birthYear: birthDate.getFullYear(),
      todayYear: today.getFullYear(),
      monthDiff,
      dayDiff: today.getDate() - birthDate.getDate()
    })
    
    if (age < minAge) {
      console.log('🔍 Age validation failed')
      return `Participant must be at least ${minAge} years old. Current age: ${age}`
    }
    
    console.log('🔍 Age validation passed')
    return null
  }

  const proceedToParticipants = () => {
    // Only create new forms if they don't exist or if the quantities have changed
    const existingFormsByDistance = participantForms.reduce((acc, form) => {
      if (!acc[form.distance_id]) {
        acc[form.distance_id] = []
      }
      acc[form.distance_id].push(form)
      return acc
    }, {} as Record<string, ParticipantFormData[]>)

    const forms: ParticipantFormData[] = []
    distanceSelections.forEach(selection => {
      const existingForms = existingFormsByDistance[selection.distance_id] || []
      for (let i = 0; i < selection.quantity; i++) {
        // Use existing form data if available
        if (existingForms[i]) {
          forms.push(existingForms[i])
        } else {
          forms.push({
            distance_id: selection.distance_id,
            distance_name: selection.distance_name,
            price: selection.price,
            min_age: selection.min_age,
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            date_of_birth: '',
            disabled: false,
            medical_aid_name: '',
            medical_aid_number: '',
            emergency_contact_name: orderData.emergency_contact_name || '',
            emergency_contact_number: orderData.emergency_contact_number || '',
            merchandise: []
          })
        }
      }
    })

    setParticipantForms(forms)
    setCurrentStep('participants')
  }

  const updateParticipantForm = async (index: number, field: keyof ParticipantFormData, value: any) => {
    // Clear modal error when user starts manually editing the form
    if (modalError) {
      setModalError('')
    }
    
    // Clear form error when user changes first name or last name (key fields for duplicate check)
    if ((field === 'first_name' || field === 'last_name') && error) {
      setError('')
    }
    
    setParticipantForms(prev => {
      const updatedForms = prev.map((form, i) => {
        if (i === index) {
          const updatedForm = { ...form, [field]: value }
          
          // Clear validation errors when field is filled
          if (field === 'first_name' && value) {
            updatedForm.firstNameError = undefined
          } else if (field === 'last_name' && value) {
            updatedForm.lastNameError = undefined
          } else if (field === 'email' && value) {
            updatedForm.emailError = undefined
          } else if (field === 'mobile' && value) {
            updatedForm.mobileError = undefined
          } else if (field === 'date_of_birth') {
            updatedForm.dateOfBirthError = undefined
            // Validate age immediately when date of birth changes
            if (value) {
              const ageError = validateAge(value, form.min_age)
              if (ageError) {
                updatedForm.ageError = ageError
                // Set global error to prevent proceeding
                setError('One or more participants do not meet the minimum age requirement')
              } else {
                updatedForm.ageError = undefined
                // Clear global error if no other age errors exist
                const otherFormsWithAgeErrors = prev.some((f, idx) => idx !== index && f.ageError)
                if (!otherFormsWithAgeErrors) {
                  setError('')
                }
              }

              // Check if senior discount applies
              const birthDate = new Date(value)
              const today = new Date()
              let age = today.getFullYear() - birthDate.getFullYear()
              const monthDiff = today.getMonth() - birthDate.getMonth()
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
              }

              // Get distance details to check senior age threshold
              const distance = registrationDetails?.event.distances.find(d => d.id === form.distance_id)
              if (distance?.free_for_seniors && age >= (distance.senior_age_threshold || 65)) {
                updatedForm.price = 0
                console.log('🎫 Applied senior discount - price set to 0')
              } else if (!updatedForm.disabled) {
                // Reset price if not senior and not disabled
                updatedForm.price = distance?.price || 0
                console.log('🎫 Reset price to original:', updatedForm.price)
              }
            }
          } else if (field === 'disabled') {
            // Check if disabled discount applies
            const distance = registrationDetails?.event.distances.find(d => d.id === form.distance_id)
            if (value && distance?.free_for_disability) {
              updatedForm.price = 0
              console.log('🎫 Applied disability discount - price set to 0')
            } else if (!value) {
              // Reset price if disability unchecked and not a senior
              const birthDate = new Date(form.date_of_birth)
              const today = new Date()
              let age = today.getFullYear() - birthDate.getFullYear()
              const monthDiff = today.getMonth() - birthDate.getMonth()
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--
              }
              if (!(distance?.free_for_seniors && age >= (distance.senior_age_threshold || 65))) {
                updatedForm.price = distance?.price || 0
                console.log('🎫 Reset price to original:', updatedForm.price)
              }
            }
          } else if (field === 'emergency_contact_name' && value) {
            updatedForm.emergencyContactNameError = undefined
          } else if (field === 'emergency_contact_number' && value) {
            updatedForm.emergencyContactNumberError = undefined
          }
          
          return updatedForm
        }
        return form
      })

      return updatedForms
    })
  }

  const checkForDuplicateParticipant = async (index: number) => {
    const form = participantForms[index]
    
    // Only check if we have the minimum required fields
    if (!form.first_name || !form.last_name || !form.email || !form.date_of_birth) {
      return
    }

    try {
      console.log('🔍 Checking for duplicate participant:', {
        event_id: registrationDetails!.event.id,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth
      })

      const checkResult = await participantRegistrationApi.checkParticipantRegistration(
        registrationDetails!.event.id,
        {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          date_of_birth: form.date_of_birth
        }
      )

      console.log('🔍 Duplicate check result:', checkResult)

      if (checkResult.success && checkResult.data?.isRegistered) {
        const errorMessage = `${form.first_name} ${form.last_name} is already registered for this event (${checkResult.data.registrationDetails?.distance_name}). Want to register someone else?`
        console.log('🔍 Setting form duplicate error:', errorMessage)
        setError(errorMessage)
      } else {
        // Clear error if no duplicate found
        setError('')
      }
    } catch (error) {
      console.error('Error checking for duplicate participant:', error)
    }
  }

  const validateParticipantAge = (index: number) => {
    console.log('🔍 validateParticipantAge called for index:', index)
    setParticipantForms(prev => prev.map((form, i) => {
      if (i === index && form.date_of_birth) {
        console.log('🔍 Validating participant:', {
          index: i,
          date_of_birth: form.date_of_birth,
          min_age: form.min_age,
          distance_name: form.distance_name
        })
        const ageError = validateAge(form.date_of_birth, form.min_age)
        console.log('🔍 Age validation result:', ageError)
        return { ...form, ageError: ageError || undefined }
      }
      return form
    }))
  }

  const handleAccountHolderSubmit = async () => {
    if (user) {
      proceedToParticipants()
      return
    }

    if (accountHolderOption === 'login') {
      if (!loginForm.email || !loginForm.password) {
        setError('Please enter your email and password')
        return
      }

      try {
        setIsLoggingIn(true)
        setLoginError('')
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginForm),
        })

        const data = await response.json()
        
        if (data.success && data.data) {
          const { user: userData, token } = data.data
          
          // Update auth context and store auth data
          updateAuthState(userData, token)
          
          // Update order data
          setOrderData(prev => ({
            ...prev,
            account_holder_first_name: userData.first_name || '',
            account_holder_last_name: userData.last_name || '',
            account_holder_email: userData.email || '',
            account_holder_mobile: userData.phone || '',
            account_holder_company: userData.company_name || '',
            account_holder_address: userData.company_address || '',
            emergency_contact_name: userData.first_name ? `${userData.first_name} ${userData.last_name}` : '',
            emergency_contact_number: userData.phone || ''
          }))
          
          // Fetch saved participants for logged in user
          await fetchSavedParticipants()
          
          // Proceed to participants step
          proceedToParticipants()
        } else {
          setError(data.error || 'Login failed')
        }
      } catch (error) {
        console.error('Login error:', error)
        setError('Login failed. Please try again.')
      } finally {
        setIsLoggingIn(false)
      }
      return
    }

    // For new accounts
    if (!accountHolderForm.first_name || !accountHolderForm.last_name || !accountHolderForm.email || !accountHolderForm.mobile) {
      setError('Please fill in all required account holder details')
      return
    }
    if (accountHolderForm.password !== accountHolderForm.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (accountHolderForm.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Update order data with account holder information
    setOrderData(prev => ({
      ...prev,
      account_holder_first_name: accountHolderForm.first_name,
      account_holder_last_name: accountHolderForm.last_name,
      account_holder_email: accountHolderForm.email,
      account_holder_mobile: accountHolderForm.mobile,
      account_holder_company: accountHolderForm.company,
      account_holder_address: accountHolderForm.address,
      emergency_contact_name: `${accountHolderForm.first_name} ${accountHolderForm.last_name}`,
      emergency_contact_number: accountHolderForm.mobile,
      account_holder_password: accountHolderForm.password
    }))

    proceedToParticipants()
  }

  const copyFromAccountHolder = (index: number) => {
    updateParticipantForm(index, 'first_name', accountHolderForm.first_name)
    updateParticipantForm(index, 'last_name', accountHolderForm.last_name)
    updateParticipantForm(index, 'email', accountHolderForm.email)
    updateParticipantForm(index, 'mobile', accountHolderForm.mobile)
    updateParticipantForm(index, 'emergency_contact_name', `${accountHolderForm.first_name} ${accountHolderForm.last_name}`)
    updateParticipantForm(index, 'emergency_contact_number', accountHolderForm.mobile)
  }

  const copyFromPrimary = (index: number) => {
    if (user) {
      updateParticipantForm(index, 'first_name', user.first_name || '')
      updateParticipantForm(index, 'last_name', user.last_name || '')
      updateParticipantForm(index, 'email', user.email || '')
      updateParticipantForm(index, 'mobile', user.phone || '')
      updateParticipantForm(index, 'emergency_contact_name', orderData.emergency_contact_name || '')
      updateParticipantForm(index, 'emergency_contact_number', orderData.emergency_contact_number || '')
    }
  }

  const loadSavedParticipant = async (index: number, savedParticipant: SavedParticipant | null) => {
    // Clear any existing modal error
    setModalError('')

    if (!savedParticipant) {
      // Clear the form
      setParticipantForms(prev => prev.map((form, i) => {
        if (i === index) {
          // Get distance details to reset price to original
          const distance = registrationDetails?.event?.distances?.find(d => d.id === form.distance_id)
          const originalPrice = distance?.price ?? 0
          
          return {
            ...form,
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            date_of_birth: '',
            medical_aid_name: '',
            medical_aid_number: '',
            emergency_contact_name: '',
            emergency_contact_number: '',
            disabled: false,
            price: originalPrice
          }
        }
        return form
      }))
      
      // Remove the allocation
      setParticipantAllocations(prev => prev.filter(a => a.participantIndex !== index))
      return
    }

    // Check if participant is already registered for this event
    const checkResult = await participantRegistrationApi.checkParticipantRegistration(
      registrationDetails!.event.id,
      {
        email: savedParticipant.email,
        first_name: savedParticipant.first_name,
        last_name: savedParticipant.last_name,
        date_of_birth: savedParticipant.date_of_birth
      }
    )

    if (checkResult.success && checkResult.data?.isRegistered) {
      const errorMessage = `${savedParticipant.first_name} ${savedParticipant.last_name} is already registered for this event (${checkResult.data.registrationDetails?.distance_name}). Want to register someone else?`
      console.log('🔍 Setting modal error message:', errorMessage)
      setModalError(errorMessage)
      return
    }

    // Fill the form with saved participant data
    setParticipantForms(prev => prev.map((form, i) => {
      if (i === index) {
        // Get distance details
        const distance = registrationDetails?.event?.distances?.find(d => d.id === form.distance_id)
        const originalPrice = distance?.price ?? 0
        
        // Calculate age for senior check
        const birthDate = savedParticipant.date_of_birth ? new Date(savedParticipant.date_of_birth) : null
        let price = originalPrice
        
        if (birthDate) {
          const today = new Date()
          let age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
          }
          
          // Apply senior discount if applicable
          if (distance?.free_for_seniors && age >= (distance.senior_age_threshold || 65)) {
            price = 0
          }
        }
        
        // Apply disability discount if applicable
        if (savedParticipant.disabled && distance?.free_for_disability) {
          price = 0
        }
        
        return {
          ...form,
          first_name: savedParticipant.first_name || '',
          last_name: savedParticipant.last_name || '',
          email: savedParticipant.email || '',
          mobile: savedParticipant.mobile || '',
          date_of_birth: savedParticipant.date_of_birth ? new Date(savedParticipant.date_of_birth).toISOString().split('T')[0] : '',
          medical_aid_name: savedParticipant.medical_aid_name || '',
          medical_aid_number: savedParticipant.medical_aid_number || '',
          emergency_contact_name: savedParticipant.emergency_contact_name || '',
          emergency_contact_number: savedParticipant.emergency_contact_number || '',
          disabled: savedParticipant.disabled || false,
          price: price
        }
      }
      return form
    }))
    
    // Add or update allocation
    setParticipantAllocations(prev => {
      const withoutCurrent = prev.filter(a => a.participantIndex !== index)
      return [...withoutCurrent, { participantId: savedParticipant.id, participantIndex: index }]
    })
    
    // Validate age
    setTimeout(() => {
      validateParticipantAge(index)
    }, 100)
  }

  const removeParticipant = (index: number) => {
    const formToRemove = participantForms[index]
    
    // Remove the participant form
    setParticipantForms(prev => prev.filter((_, i) => i !== index))
    
    // Update distance selections to reflect the removal
    setDistanceSelections(prev => prev.map(selection => {
      if (selection.distance_id === formToRemove.distance_id) {
        return {
          ...selection,
          quantity: Math.max(0, selection.quantity - 1)
        }
      }
      return selection
    }))
    
    // Remove participant allocation
    setParticipantAllocations(prev => prev.filter(a => a.participantIndex !== index))
  }

  const proceedToCheckout = async () => {
    try {
      console.log('🔍 Starting proceedToCheckout')
      setSubmitting(true)
      // Clear any existing error
      setError('')

      // Validate all participant forms and add validation errors
      let hasErrors = false
      let ageValidationErrors = false
    
    setParticipantForms(prev => prev.map(form => {
      const updatedForm = { ...form }
      
      // Check for missing required fields
      if (!form.first_name) {
        updatedForm.firstNameError = 'First name is required'
        hasErrors = true
      } else {
        updatedForm.firstNameError = undefined
      }
      
      if (!form.last_name) {
        updatedForm.lastNameError = 'Last name is required'
        hasErrors = true
      } else {
        updatedForm.lastNameError = undefined
      }
      
      if (!form.email) {
        updatedForm.emailError = 'Email is required'
        hasErrors = true
      } else {
        updatedForm.emailError = undefined
      }
      
      if (!form.mobile) {
        updatedForm.mobileError = 'Mobile number is required'
        hasErrors = true
      } else {
        updatedForm.mobileError = undefined
      }
      
      if (!form.date_of_birth) {
        updatedForm.dateOfBirthError = 'Date of birth is required'
        hasErrors = true
      } else {
        // Validate age for each participant
        const ageError = validateAge(form.date_of_birth, form.min_age)
        if (ageError) {
          updatedForm.ageError = ageError
          ageValidationErrors = true
          hasErrors = true
        } else {
          updatedForm.ageError = undefined
        }
      }
      
      if (!form.emergency_contact_name) {
        updatedForm.emergencyContactNameError = 'Emergency contact name is required'
        hasErrors = true
      } else {
        updatedForm.emergencyContactNameError = undefined
      }
      
      if (!form.emergency_contact_number) {
        updatedForm.emergencyContactNumberError = 'Emergency contact number is required'
        hasErrors = true
      } else {
        updatedForm.emergencyContactNumberError = undefined
      }
      
      return updatedForm
    }))

    if (hasErrors) {
      if (ageValidationErrors) {
        setError('One or more participants do not meet the minimum age requirement for their selected distance')
      } else {
        setError('Please fill in all required participant details and fix any validation errors')
      }
      return
    }

    // Check each participant for existing registration
    for (const form of participantForms) {
      console.log('🔍 Checking participant:', {
        event_id: registrationDetails!.event.id,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name
      })

      try {
          const checkResult = await participantRegistrationApi.checkParticipantRegistration(
            registrationDetails!.event.id,
            {
              email: form.email,
              first_name: form.first_name,
              last_name: form.last_name,
              date_of_birth: form.date_of_birth
            }
          )

        console.log('🔍 Check result:', checkResult)

        if (checkResult.success && checkResult.data?.isRegistered) {
          const errorMessage = `${form.first_name} ${form.last_name} is already registered for this event (${checkResult.data.registrationDetails?.distance_name}). Want to register someone else?`
          console.log('❌ Setting error:', errorMessage)
          setError(errorMessage)
          return
        }
      } catch (error) {
        console.error('Error checking participant registration:', error)
        setError('Failed to verify participant registration. Please try again.')
        return
      }
    }

    setCurrentStep('checkout')
    } catch (error) {
      console.error('Error checking participants:', error)
      setError('Failed to verify participant registration. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotal = () => {
    let total = 0
    participantForms.forEach(form => {
      total += Number(form.price) || 0
      form.merchandise?.forEach(merch => {
        total += (Number(merch.unit_price) || 0) * (Number(merch.quantity) || 0)
      })
    })
    return total
  }

  const handleSubmitRegistration = async () => {
    try {
      setSubmitting(true)
      setError('')

      const registrationOrderData: OrderData = {
        event_id: orderData.event_id!,
        account_holder_first_name: orderData.account_holder_first_name!,
        account_holder_last_name: orderData.account_holder_last_name!,
        account_holder_email: orderData.account_holder_email!,
        account_holder_mobile: orderData.account_holder_mobile!,
        account_holder_company: orderData.account_holder_company,
        account_holder_address: orderData.account_holder_address!,
        emergency_contact_name: orderData.emergency_contact_name!,
        emergency_contact_number: orderData.emergency_contact_number!,
        account_holder_password: orderData.account_holder_password,
        participants: participantForms.map(form => ({
          distance_id: form.distance_id,
          participant: {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            mobile: form.mobile,
            date_of_birth: form.date_of_birth,
            disabled: form.disabled,
            medical_aid_name: form.medical_aid_name,
            medical_aid_number: form.medical_aid_number,
            emergency_contact_name: form.emergency_contact_name,
            emergency_contact_number: form.emergency_contact_number,
            merchandise: form.merchandise
          }
        }))
      }

      console.log('Registration data being sent:', JSON.stringify(registrationOrderData, null, 2))
      const response = await participantRegistrationApi.register(registrationOrderData)
      
      if (response.success) {
        // Store order data in sessionStorage for the success page
        const orderId = response.data?.order?.id
        const orderData = response.data?.order
        const ticketsData = response.data?.tickets
        
        if (orderData && ticketsData) {
          sessionStorage.setItem('registration_order', JSON.stringify({
            order: orderData,
            tickets: ticketsData
          }))
        }
        
        // If authentication data is provided, log the user in BEFORE redirecting
        if ((response.data as any)?.auth) {
          console.log('🔐 Registration response includes auth data:', (response.data as any).auth)
          // Update auth context immediately
          updateAuthState((response.data as any).auth.user, (response.data as any).auth.token)
          console.log('🔐 Auth state updated, token stored in localStorage')
        } else {
          console.log('🔐 No auth data in registration response')
        }

        // Use window.location.href to force a full page navigation to the success page
        window.location.href = `/events/${slug}/registration-success?orderId=${orderId}`
      } else {
        setError(response.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !registrationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Unavailable</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href={`/events/${slug}`}>
            <Button>Back to Event</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!registrationDetails) {
    return null
  }

  const event = registrationDetails.event

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/events/${slug}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Event
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register for {event.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(event.start_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {event.start_time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.city}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-6">
            <div className={`flex items-center ${currentStep === 'distances' ? 'text-blue-600' : ['account', 'participants', 'checkout'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'distances' ? 'bg-blue-600 text-white' : ['account', 'participants', 'checkout'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Distances</span>
            </div>
            <div className={`flex items-center ${currentStep === 'account' ? 'text-blue-600' : ['participants', 'checkout'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'account' ? 'bg-blue-600 text-white' : ['participants', 'checkout'].includes(currentStep) ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Account Holder</span>
            </div>
            <div className={`flex items-center ${currentStep === 'participants' ? 'text-blue-600' : currentStep === 'checkout' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'participants' ? 'bg-blue-600 text-white' : currentStep === 'checkout' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Participant Details</span>
            </div>
            <div className={`flex items-center ${currentStep === 'checkout' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'checkout' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                4
              </div>
              <span className="ml-2 font-medium">Checkout</span>
            </div>
          </div>
        </div>

        {error && (currentStep === 'checkout' || currentStep === 'participants') && (
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Distance Selection */}
        {currentStep === 'distances' && (
          <Card>
            <CardHeader>
              <CardTitle>Select Distances</CardTitle>
              <CardDescription>
                Choose the distances you want to register for and the number of participants for each.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.distances.map((distance) => (
                <div key={distance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{distance.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>R{distance.price}</span>
                      {distance.min_age && <span>Min age: {distance.min_age}</span>}
                      {distance.entry_limit && <span>Limit: {distance.entry_limit}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDistanceQuantityChange(distance.id, Math.max(0, (distanceSelections.find(d => d.distance_id === distance.id)?.quantity || 0) - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">
                      {distanceSelections.find(d => d.distance_id === distance.id)?.quantity || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDistanceQuantityChange(distance.id, (distanceSelections.find(d => d.distance_id === distance.id)?.quantity || 0) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <Button onClick={proceedToAccount} disabled={distanceSelections.length === 0}>
                  Continue to Account Holder
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Account Holder */}
        {currentStep === 'account' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Holder Information</CardTitle>
                <CardDescription>
                  {user ? 
                    "You're already logged in. Your account details will be used for this registration." :
                    "Please log in to your existing account or create a new account to continue with registration."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!user && (
                  <div className="space-y-4">
                    <div className="flex space-x-4">
                      <Button
                        variant={accountHolderOption === 'login' ? 'default' : 'outline'}
                        onClick={() => setAccountHolderOption('login')}
                        className="flex-1"
                      >
                        I have an account
                      </Button>
                      <Button
                        variant={accountHolderOption === 'new' ? 'default' : 'outline'}
                        onClick={() => setAccountHolderOption('new')}
                        className="flex-1"
                      >
                        Create new account
                      </Button>
                    </div>

                    {accountHolderOption === 'login' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Login to your account</h3>
                        {loginError && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{loginError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="login_email">Email *</Label>
                            <Input
                              id="login_email"
                              type="email"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="login_password">Password *</Label>
                            <PasswordInput
                              id="login_password"
                              value={loginForm.password}
                              onChange={(value) => setLoginForm(prev => ({ ...prev, password: value }))}
                              required
                              showPassword={showLoginPassword}
                              onToggleVisibility={() => setShowLoginPassword(!showLoginPassword)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {accountHolderOption === 'new' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">Create new account</h3>
                        <p className="text-sm text-gray-600">
                          An account will be created for you during checkout. Fill in your details below.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="account_first_name">First Name *</Label>
                            <Input
                              id="account_first_name"
                              value={accountHolderForm.first_name}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, first_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_last_name">Last Name *</Label>
                            <Input
                              id="account_last_name"
                              value={accountHolderForm.last_name}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, last_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_email">Email *</Label>
                            <Input
                              id="account_email"
                              type="email"
                              value={accountHolderForm.email}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_mobile">Mobile Number *</Label>
                            <Input
                              id="account_mobile"
                              value={accountHolderForm.mobile}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, mobile: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_company">Company (Optional)</Label>
                            <Input
                              id="account_company"
                              value={accountHolderForm.company}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, company: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_address">Address (Optional)</Label>
                            <Input
                              id="account_address"
                              value={accountHolderForm.address}
                              onChange={(e) => setAccountHolderForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_password">Password *</Label>
                            <PasswordInput
                              id="account_password"
                              value={accountHolderForm.password}
                              onChange={(value) => setAccountHolderForm(prev => ({ ...prev, password: value }))}
                              required
                              showPassword={showAccountPassword}
                              onToggleVisibility={() => setShowAccountPassword(!showAccountPassword)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="account_confirm_password">Confirm Password *</Label>
                            <PasswordInput
                              id="account_confirm_password"
                              value={accountHolderForm.confirm_password}
                              onChange={(value) => setAccountHolderForm(prev => ({ ...prev, confirm_password: value }))}
                              required
                              showPassword={showConfirmPassword}
                              onToggleVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {user && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Logged in as {user.first_name} {user.last_name}</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Your account details will be used for this registration. You can copy your details to participant forms.
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('distances')}>
                    Back to Distances
                  </Button>
                  <Button 
                    onClick={handleAccountHolderSubmit}
                    disabled={
                      isLoggingIn || 
                      (!user && accountHolderOption === 'login' && (!loginForm.email || !loginForm.password)) ||
                      (!user && accountHolderOption === 'new' && (!accountHolderForm.first_name || !accountHolderForm.last_name || !accountHolderForm.email || !accountHolderForm.mobile || !accountHolderForm.password))
                    }
                  >
                    {isLoggingIn ? 'Logging in...' : 'Continue to Participants'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Participant Details */}
        {currentStep === 'participants' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Participant Details</CardTitle>
                <CardDescription>
                  Fill in the details for each participant. You can copy from your account or load saved participants.
                </CardDescription>
              </CardHeader>
            </Card>

            {participantForms.map((form, index) => (
              <Card key={index} className="relative">
                {/* Remove button - positioned in top right */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                  onClick={() => removeParticipant(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <CardHeader>
                  <div className="flex items-center justify-between pr-10">
                    <div>
                      <CardTitle className="text-lg">Participant {index + 1}</CardTitle>
                      <CardDescription>{form.distance_name} - R{Number(form.price).toFixed(2)}</CardDescription>
                      {form.min_age && (
                        <p className="text-xs text-gray-500 mt-1">Minimum age: {form.min_age} years</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyFromAccountHolder(index)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy from Account Holder
                        </Button>
                      )}
                      {savedParticipants.length > 0 && (
                        <SavedParticipantsModal
                          savedParticipants={savedParticipants}
                          participantAllocations={participantAllocations}
                          participantIndex={index}
                          currentParticipantId={savedParticipants.find(p => 
                            p.first_name === form.first_name && 
                            p.last_name === form.last_name && 
                            p.email === form.email
                          )?.id}
                          onSelectParticipant={(participant) => loadSavedParticipant(index, participant)}
                          anyParticipantSelected={participantAllocations.some(a => a.participantIndex === index)}
                          user={user}
                          error={modalError}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`first_name_${index}`}>First Name *</Label>
                      <Input
                        id={`first_name_${index}`}
                        value={form.first_name}
                        onChange={(e) => updateParticipantForm(index, 'first_name', e.target.value)}
                        required
                        className={form.firstNameError ? 'border-red-500' : ''}
                      />
                      {form.firstNameError && (
                        <p className="text-red-500 text-sm mt-1">{form.firstNameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`last_name_${index}`}>Last Name *</Label>
                      <Input
                        id={`last_name_${index}`}
                        value={form.last_name}
                        onChange={(e) => updateParticipantForm(index, 'last_name', e.target.value)}
                        required
                        className={form.lastNameError ? 'border-red-500' : ''}
                      />
                      {form.lastNameError && (
                        <p className="text-red-500 text-sm mt-1">{form.lastNameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`email_${index}`}>Email *</Label>
                      <Input
                        id={`email_${index}`}
                        type="email"
                        value={form.email}
                        onChange={(e) => updateParticipantForm(index, 'email', e.target.value)}
                        required
                        className={form.emailError ? 'border-red-500' : ''}
                      />
                      {form.emailError && (
                        <p className="text-red-500 text-sm mt-1">{form.emailError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`mobile_${index}`}>Mobile Number *</Label>
                      <Input
                        id={`mobile_${index}`}
                        value={form.mobile}
                        onChange={(e) => updateParticipantForm(index, 'mobile', e.target.value)}
                        required
                        className={form.mobileError ? 'border-red-500' : ''}
                      />
                      {form.mobileError && (
                        <p className="text-red-500 text-sm mt-1">{form.mobileError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`date_of_birth_${index}`}>Date of Birth *</Label>
                      <Input
                        id={`date_of_birth_${index}`}
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => {
                          const value = e.target.value
                          console.log('🔍 Date of birth changed for index:', index, 'to:', value)
                          
                          // Get the current form data
                          const currentForm = participantForms[index]
                          
                          // Validate age immediately
                          const ageError = validateAge(value, currentForm.min_age)
                          console.log('🔍 Age validation result:', { ageError, min_age: currentForm.min_age })
                          
                          // Update form with validation result
                          updateParticipantForm(index, 'date_of_birth', value)
                          if (ageError) {
                            updateParticipantForm(index, 'ageError', ageError)
                            setError('One or more participants do not meet the minimum age requirement')
                          } else {
                            updateParticipantForm(index, 'ageError', undefined)
                            // Only clear error if no other age errors exist
                            const otherFormsWithAgeErrors = participantForms.some((f, idx) => idx !== index && f.ageError)
                            if (!otherFormsWithAgeErrors) {
                              setError('')
                            }
                          }
                        }}
                        onBlur={() => {
                          console.log('🔍 Date of birth onBlur triggered for index:', index)
                          validateParticipantAge(index)
                          // Check for duplicate after age validation
                          setTimeout(() => {
                            checkForDuplicateParticipant(index)
                          }, 100)
                        }}
                        required
                        className={form.dateOfBirthError || form.ageError ? 'border-red-500' : ''}
                      />
                      {form.dateOfBirthError && (
                        <p className="text-red-500 text-sm mt-1">{form.dateOfBirthError}</p>
                      )}
                      {form.ageError && (
                        <p className="text-red-500 text-sm mt-1">{form.ageError}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`disabled_${index}`}
                        checked={form.disabled}
                        onCheckedChange={(checked) => updateParticipantForm(index, 'disabled', checked)}
                      />
                      <Label htmlFor={`disabled_${index}`}>Disabled (Free entry if applicable)</Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`medical_aid_name_${index}`}>Medical Aid Name</Label>
                      <Input
                        id={`medical_aid_name_${index}`}
                        value={form.medical_aid_name}
                        onChange={(e) => updateParticipantForm(index, 'medical_aid_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`medical_aid_number_${index}`}>Medical Aid Number</Label>
                      <Input
                        id={`medical_aid_number_${index}`}
                        value={form.medical_aid_number}
                        onChange={(e) => updateParticipantForm(index, 'medical_aid_number', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`emergency_contact_name_${index}`}>Emergency Contact Name *</Label>
                      <Input
                        id={`emergency_contact_name_${index}`}
                        value={form.emergency_contact_name}
                        onChange={(e) => updateParticipantForm(index, 'emergency_contact_name', e.target.value)}
                        required
                        className={form.emergencyContactNameError ? 'border-red-500' : ''}
                      />
                      {form.emergencyContactNameError && (
                        <p className="text-red-500 text-sm mt-1">{form.emergencyContactNameError}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`emergency_contact_number_${index}`}>Emergency Contact Number *</Label>
                      <Input
                        id={`emergency_contact_number_${index}`}
                        value={form.emergency_contact_number}
                        onChange={(e) => updateParticipantForm(index, 'emergency_contact_number', e.target.value)}
                        required
                        className={form.emergencyContactNumberError ? 'border-red-500' : ''}
                      />
                      {form.emergencyContactNumberError && (
                        <p className="text-red-500 text-sm mt-1">{form.emergencyContactNumberError}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('account')}>
                Back to Account Holder
              </Button>
              <Button 
                onClick={proceedToCheckout} 
                disabled={
                  submitting || 
                  error !== '' || 
                  participantForms.some(form => form.ageError || !form.date_of_birth)
                }
              >
                {submitting ? 'Checking...' : 'Continue to Checkout'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Checkout */}
        {currentStep === 'checkout' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your registration details before proceeding to payment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {participantForms.map((form, index) => {
                  // Get distance details
                  const distance = registrationDetails?.event.distances.find(d => d.id === form.distance_id)
                  const originalPrice = distance?.price || 0
                  const currentPrice = form.price || 0
                  const hasDiscount = originalPrice > currentPrice

                  // Calculate age for senior check
                  const birthDate = new Date(form.date_of_birth)
                  const today = new Date()
                  let age = today.getFullYear() - birthDate.getFullYear()
                  const monthDiff = today.getMonth() - birthDate.getMonth()
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--
                  }

                  // Determine discount reason
                  let discountReason = ''
                  if (form.disabled && distance?.free_for_disability) {
                    discountReason = 'Disability Discount'
                  } else if (distance?.free_for_seniors && age >= (distance.senior_age_threshold || 65)) {
                    discountReason = `Senior Discount (${age} years)`
                  }

                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{form.first_name} {form.last_name}</h4>
                          <p className="text-sm text-gray-600">{form.distance_name}</p>
                          <p className="text-sm text-gray-600">{form.email}</p>
                        </div>
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Entry Fee</span>
                          <span>R{Number(originalPrice).toFixed(2)}</span>
                        </div>
                        
                        {hasDiscount && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>{discountReason}</span>
                            <span>-R{Number(originalPrice - currentPrice).toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-semibold border-t pt-1">
                          <span>Total</span>
                          <span>R{Number(currentPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                <Separator />
                
                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-base">
                    <span>Subtotal</span>
                    <span>R{Number(participantForms?.reduce((total, form) => {
                      const distance = registrationDetails?.event?.distances?.find(d => d.id === form.distance_id)
                      const price = distance?.price ?? 0
                      return total + price
                    }, 0) ?? 0).toFixed(2)}</span>
                  </div>
                  
                  {/* Show total discounts if any */}
                  {participantForms.some(form => {
                    const distance = registrationDetails?.event?.distances?.find(d => d.id === form.distance_id)
                    const originalPrice = distance?.price ?? 0
                    const currentPrice = form.price ?? 0
                    return originalPrice > currentPrice
                  }) && (
                    <div className="flex justify-between items-center text-base text-green-600">
                      <span>Total Discounts</span>
                      <span>-R{Number(participantForms?.reduce((total, form) => {
                        const distance = registrationDetails?.event?.distances?.find(d => d.id === form.distance_id)
                        const originalPrice = distance?.price ?? 0
                        const currentPrice = form.price ?? 0
                        return total + (originalPrice - currentPrice)
                      }, 0) ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>R{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('participants')}>
                Back to Participants
              </Button>
              <Button 
                onClick={handleSubmitRegistration} 
                disabled={submitting || error !== ''}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'Processing...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
