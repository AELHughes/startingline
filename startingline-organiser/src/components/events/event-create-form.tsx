'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events'
import { storageApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Plus, Upload, Check, AlertCircle, Calendar, MapPin, Users, DollarSign, Package, Image as ImageIcon, CheckCircle, Circle } from 'lucide-react'

interface EventDistance {
  id?: string
  name: string
  distance_km: number
  price: number
  min_age?: number
  entry_limit?: number
  start_time?: string
  free_for_seniors: boolean
  free_for_disability: boolean
  senior_age_threshold?: number
}

interface MerchandiseVariation {
  name: string
  options: string[]
}

interface EventMerchandise {
  id?: string
  name: string
  description?: string
  price: number
  image_url?: string
  variations: MerchandiseVariation[]
}

interface FormData {
  // Basic Info
  name: string
  category: string
  event_type: 'single' | 'multi'
  start_date: string
  end_date?: string
  start_time: string
  description?: string

  // Location
  venue_name?: string
  address: string
  city: string
  province: string
  latitude?: number
  longitude?: number

  // Licensing
  license_required: boolean
  temp_license_fee?: number
  license_details?: string

  // Media
  primary_image_url?: string
  gallery_images?: string[]

  // Related Data
  distances: EventDistance[]
  merchandise: EventMerchandise[]
}

const CATEGORIES = [
  { value: 'road-cycling', label: 'Road Cycling' },
  { value: 'road-running', label: 'Road Running' },
  { value: 'trail-running', label: 'Trail Running' },
  { value: 'mountain-biking', label: 'Mountain Biking' },
  { value: 'triathlon', label: 'Triathlon' }
]

const PROVINCES = [
  'Eastern Cape',
  'Free State', 
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
]

interface EventCreateFormProps {
  initialData?: any
  isEditing?: boolean
  eventId?: string
  canEdit?: boolean
}

export default function EventCreateForm({ 
  initialData, 
  isEditing = false, 
  eventId,
  canEdit = true 
}: EventCreateFormProps = {}) {
  const router = useRouter()
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    event_type: 'single',
    start_date: '',
    end_date: '',
    start_time: '',
    description: '',
    venue_name: '',
    address: '',
    city: '',
    province: '',
    license_required: false,
    temp_license_fee: 0,
    license_details: '',
    primary_image_url: '',
    gallery_images: [],
    distances: [],
    merchandise: []
  })

  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('basic')

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('🔄 Populating form with initial data:', initialData)
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        event_type: initialData.event_type || 'single',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        start_time: initialData.start_time || '',
        description: initialData.description || '',
        venue_name: initialData.venue_name || '',
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        country: initialData.country || 'South Africa',
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null,
        license_required: initialData.license_required || false,
        temp_license_fee: initialData.temp_license_fee || '',
        license_details: initialData.license_details || '',
        primary_image_url: initialData.primary_image_url || '',
        gallery_images: initialData.gallery_images || [],
        distances: initialData.distances || [],
        merchandise: (initialData.merchandise || []).map((merch: any) => ({
          ...merch,
          variations: (merch.variations || []).map((variation: any) => ({
            ...variation,
            options: variation.options || []
          }))
        }))
      })
    }
  }, [initialData, isEditing])

  // Tab completion checking functions
  const isBasicInfoComplete = (): boolean => {
    return !!(
      formData.name.trim() && 
      formData.category && 
      formData.event_type &&
      formData.start_date && 
      formData.start_time &&
      (formData.event_type === 'single' || formData.end_date)
    )
  }

  const isLocationComplete = (): boolean => {
    return !!(
      formData.address.trim() && 
      formData.city.trim() && 
      formData.province
    )
  }

  const isDistancesComplete = (): boolean => {
    return formData.distances.length > 0 && 
           formData.distances.every(d => d.name.trim() && d.distance_km > 0 && d.price >= 0)
  }

  const isMerchandiseComplete = (): boolean => {
    // Only show as complete if merchandise items are actually added and properly filled out
    return formData.merchandise.length > 0 && 
           formData.merchandise.every(m => m.name.trim() && m.price > 0 && m.description.trim())
  }

  // Completion indicator component
  const CompletionIndicator = ({ isComplete }: { isComplete: boolean }) => {
    if (isComplete) {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    }
    return <Circle className="h-3 w-3 text-gray-400" />
  }

  // Required/Optional indicator component
  const RequiredIndicator = ({ isOptional }: { isOptional?: boolean }) => {
    if (isOptional) {
      return <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
    }
    return <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Required</span>
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic Info
    if (!formData.name.trim()) newErrors.name = 'Event name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.start_time) newErrors.start_time = 'Start time is required'
    
    // Date validation
    if (formData.start_date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      const startDate = new Date(formData.start_date)
      if (startDate < today) {
        newErrors.start_date = 'Start date cannot be in the past'
      }
    }
    
    if (formData.event_type === 'multi' && !formData.end_date) {
      newErrors.end_date = 'End date is required for multi-day events'
    }
    if (formData.event_type === 'multi' && formData.end_date && formData.start_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date'
      }
    }

    // Location
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.province) newErrors.province = 'Province is required'

    // Distances
    if (formData.distances.length === 0) {
      newErrors.distances = 'At least one distance is required'
    } else {
      formData.distances.forEach((distance, index) => {
        if (!distance.name.trim()) newErrors[`distance_${index}_name`] = 'Distance name is required'
        if (distance.distance_km <= 0) newErrors[`distance_${index}_distance`] = 'Distance must be greater than 0'
        if (distance.price < 0) newErrors[`distance_${index}_price`] = 'Price cannot be negative'
      })
    }

    // Merchandise validation
    formData.merchandise.forEach((merch, index) => {
      if (!merch.name.trim()) newErrors[`merch_${index}_name`] = 'Merchandise name is required'
      if (merch.price < 0) newErrors[`merch_${index}_price`] = 'Price cannot be negative'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission for Save Draft
  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit('draft')
  }

  // Handle form submission for Submit for Approval
  const handleSubmitForApproval = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit('pending_approval')
  }

  // Main submit handler
  const handleSubmit = async (status: 'draft' | 'pending_approval') => {
    if (!validateForm()) {
      return
    }

    try {
      console.log('🔍 Submitting event data:', formData)
      console.log('🔍 Event ID:', eventId)
      console.log('🔍 Is editing:', isEditing)
      console.log('🔍 Status:', status)

      const eventData = {
        ...formData,
        // Set status based on action
        status: isEditing ? undefined : status, // Don't override status when editing
        // Map venue_name to venue for backend compatibility
        venue: formData.venue_name,
        // Map primary_image_url to image_url for backend compatibility  
        image_url: formData.primary_image_url,
        // Transform merchandise variations to match backend structure
        merchandise: formData.merchandise.map(merch => ({
          ...merch,
          variations: merch.variations
            .filter(v => v.name && v.options && v.options.length > 0) // Filter out empty variations
            .map(v => ({
              variation_name: v.name,
              variation_options: v.options
            }))
        }))
      }

      console.log('🚀 Transformed event data for backend:', eventData)
      console.log('📦 Merchandise with variations:', eventData.merchandise)

      let result
      if (isEditing && eventId) {
        result = await updateEventMutation.mutateAsync({ eventId, eventData })
        console.log('✅ Event updated successfully')
      } else {
        result = await createEventMutation.mutateAsync(eventData)
        console.log('✅ Event created successfully')
      }

      // Success - redirect appropriately
      if (isEditing) {
        router.push('/dashboard/events')
      } else if (result?.slug) {
        router.push(`/events/${result.slug}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Create event error:', error)
      setErrors({ submit: error.message || 'Failed to create event' })
    }
  }

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'primary' | 'gallery' = 'primary') => {
    try {
      setUploading(true)
      const folder = type === 'primary' ? 'events' : 'gallery'
      const imageUrl = await storageApi.uploadImage(file, folder)

      if (type === 'primary') {
        setFormData(prev => ({ ...prev, primary_image_url: imageUrl }))
      } else {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...(prev.gallery_images || []), imageUrl]
        }))
      }
    } catch (error: any) {
      console.error('Image upload error:', error)
      setErrors({ ...errors, image: error.message || 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  // Distance management
  const addDistance = () => {
    setFormData(prev => ({
      ...prev,
      distances: [
        ...prev.distances,
        {
          name: '',
          distance_km: 0,
          price: 0,
          min_age: undefined,
          entry_limit: undefined,
          start_time: '',
          free_for_seniors: false,
          free_for_disability: false,
          senior_age_threshold: 65
        }
      ]
    }))
  }

  const removeDistance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      distances: prev.distances.filter((_, i) => i !== index)
    }))
  }

  const updateDistance = (index: number, field: keyof EventDistance, value: any) => {
    setFormData(prev => ({
      ...prev,
      distances: prev.distances.map((distance, i) =>
        i === index ? { ...distance, [field]: value } : distance
      )
    }))
  }

  // Merchandise management
  const addMerchandise = () => {
    setFormData(prev => ({
      ...prev,
      merchandise: [
        ...prev.merchandise,
        {
          name: '',
          description: '',
          price: 0,
          image_url: '',
          variations: []
        }
      ]
    }))
  }

  const removeMerchandise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.filter((_, i) => i !== index)
    }))
  }

  const updateMerchandise = (index: number, field: keyof EventMerchandise, value: any) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === index ? { ...merch, [field]: value } : merch
      )
    }))
  }

  const addMerchandiseVariation = (merchIndex: number) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: [
                ...merch.variations,
                { name: '', options: [''] }
              ]
            }
          : merch
      )
    }))
  }

  const removeMerchandiseVariation = (merchIndex: number, variationIndex: number) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: merch.variations.filter((_, vi) => vi !== variationIndex)
            }
          : merch
      )
    }))
  }

  const updateMerchandiseVariation = (
    merchIndex: number,
    variationIndex: number,
    field: keyof MerchandiseVariation,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: merch.variations.map((variation, vi) =>
                vi === variationIndex ? { ...variation, [field]: value } : variation
              )
            }
          : merch
      )
    }))
  }

  const addVariationOption = (merchIndex: number, variationIndex: number) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: merch.variations.map((variation, vi) =>
                vi === variationIndex
                  ? { ...variation, options: [...variation.options, ''] }
                  : variation
              )
            }
          : merch
      )
    }))
  }

  const removeVariationOption = (merchIndex: number, variationIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: merch.variations.map((variation, vi) =>
                vi === variationIndex
                  ? {
                      ...variation,
                      options: variation.options.filter((_, oi) => oi !== optionIndex)
                    }
                  : variation
              )
            }
          : merch
      )
    }))
  }

  const updateVariationOption = (
    merchIndex: number,
    variationIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      merchandise: prev.merchandise.map((merch, i) =>
        i === merchIndex
          ? {
              ...merch,
              variations: merch.variations.map((variation, vi) =>
                vi === variationIndex
                  ? {
                      ...variation,
                      options: variation.options.map((option, oi) =>
                        oi === optionIndex ? value : option
                      )
                    }
                  : variation
              )
            }
          : merch
      )
    }))
  }

  // Handle merchandise image upload
  const handleMerchandiseImageUpload = async (file: File, merchIndex: number) => {
    try {
      setUploading(true)
      const imageUrl = await storageApi.uploadImage(file, 'merchandise')
      updateMerchandise(merchIndex, 'image_url', imageUrl)
    } catch (error: any) {
      console.error('Merchandise image upload error:', error)
      setErrors({ ...errors, [`merch_${merchIndex}_image`]: error.message || 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  // Navigation helpers
  const tabs = ['basic', 'location', 'distances', 'merchandise']
  const currentTabIndex = tabs.indexOf(activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1

  const goToNextTab = () => {
    if (!isLastTab) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
  }

  const goToPreviousTab = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[currentTabIndex - 1])
    }
  }

  // Check if current tab is valid to enable Next button
  const isCurrentTabValid = () => {
    switch (activeTab) {
      case 'basic':
        return isBasicInfoComplete()
      case 'location':
        return isLocationComplete()
      case 'distances':
        return isDistancesComplete()
      case 'merchandise':
        return true // Merchandise is optional
      default:
        return false
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update your event details' : 'Fill in the details to create your event'}
          </p>
        </div>
        
        {/* Submit Buttons - Top Right */}
        {!isEditing && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmitDraft}
              disabled={
                !canEdit ||
                createEventMutation.isPending || 
                uploading || 
                !isBasicInfoComplete() || 
                !isLocationComplete() || 
                !isDistancesComplete()
              }
              className="min-w-32"
            >
              {createEventMutation.isPending ? (
                'Saving...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={
                !canEdit ||
                createEventMutation.isPending || 
                uploading || 
                !isBasicInfoComplete() || 
                !isLocationComplete() || 
                !isDistancesComplete()
              }
              className="min-w-40"
            >
              {createEventMutation.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit for Approval
                </>
              )}
            </Button>
          </div>
        )}
        {isEditing && (
          <Button
            type="submit"
            form="event-form"
            disabled={
              !canEdit ||
              updateEventMutation.isPending || 
              uploading || 
              !isBasicInfoComplete() || 
              !isLocationComplete() || 
              !isDistancesComplete()
            }
            className="min-w-32"
          >
            {updateEventMutation.isPending ? (
              'Updating...'
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update Event
              </>
            )}
          </Button>
        )}
      </div>

      <form id="event-form" className="space-y-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{currentTabIndex + 1} of {tabs.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentTabIndex + 1) / tabs.length) * 100}%` }}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Basic Info
                <CompletionIndicator isComplete={isBasicInfoComplete()} />
              </div>
              <RequiredIndicator />
            </TabsTrigger>
            <TabsTrigger value="location" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
                <CompletionIndicator isComplete={isLocationComplete()} />
              </div>
              <RequiredIndicator />
            </TabsTrigger>
            <TabsTrigger value="distances" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Distances
                <CompletionIndicator isComplete={isDistancesComplete()} />
              </div>
              <RequiredIndicator />
            </TabsTrigger>
            <TabsTrigger value="merchandise" className="flex flex-col items-center gap-1 py-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Merchandise
                <CompletionIndicator isComplete={isMerchandiseComplete()} />
              </div>
              <RequiredIndicator isOptional />
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
                <CardDescription>
                  Basic information about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="mb-2 font-medium">Event Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter event name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="category" className="mb-2 font-medium">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <Label htmlFor="event_type" className="mb-2 font-medium">Event Type *</Label>
                    <Select
                      value={formData.event_type}
                      onValueChange={(value: 'single' | 'multi') => {
                        setFormData(prev => ({ 
                          ...prev, 
                          event_type: value,
                          // Clear end_date when switching to single day
                          end_date: value === 'single' ? '' : prev.end_date
                        }))
                      }}
                    >
                      <SelectTrigger className={errors.event_type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Day</SelectItem>
                        <SelectItem value="multi">Multi-Day</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.event_type && <p className="text-sm text-red-500 mt-1">{errors.event_type}</p>}
                  </div>

                  <div>
                    <Label htmlFor="start_date" className="mb-2 font-medium">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className={errors.start_date ? 'border-red-500' : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="end_date" className="mb-2 font-medium">
                      End Date {formData.event_type === 'multi' ? '*' : ''}
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className={errors.end_date ? 'border-red-500' : ''}
                      disabled={formData.event_type === 'single'}
                      placeholder={formData.event_type === 'single' ? 'Single day event' : ''}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                    />
                    {errors.end_date && <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>}
                    {formData.event_type === 'single' && (
                      <p className="text-sm text-gray-500 mt-1">End date is only required for multi-day events</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="start_time" className="mb-2 font-medium">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                      className={errors.start_time ? 'border-red-500' : ''}
                    />
                    {errors.start_time && <p className="text-sm text-red-500 mt-1">{errors.start_time}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2 font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your event..."
                    rows={4}
                  />
                </div>

                {/* Event Image Upload */}
                <div>
                  <Label>Event Image</Label>
                  <div className="mt-2">
                    {formData.primary_image_url ? (
                      <div className="relative">
                        <img
                          src={formData.primary_image_url}
                          alt="Event"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData(prev => ({ ...prev, primary_image_url: '' }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploading}
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/*'
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handleImageUpload(file, 'primary')
                              }
                              input.click()
                            }}
                          >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Event Location
                </CardTitle>
                <CardDescription>
                  Where will your event take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue_name" className="mb-2 font-medium">Venue Name</Label>
                  <Input
                    id="venue_name"
                    value={formData.venue_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                    placeholder="Enter venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="mb-2 font-medium">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="mb-2 font-medium">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="province" className="mb-2 font-medium">Province *</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, province: value }))}
                    >
                      <SelectTrigger className={errors.province ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
                  </div>
                </div>

                {/* Licensing */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="license_required"
                      checked={formData.license_required}
                      onChange={(e) => setFormData(prev => ({ ...prev, license_required: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="license_required">Temporary license required</Label>
                  </div>

                  {formData.license_required && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="temp_license_fee" className="mb-2 font-medium">License Fee (R)</Label>
                        <Input
                          id="temp_license_fee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.temp_license_fee || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, temp_license_fee: parseFloat(e.target.value) || 0 }))}
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <Label htmlFor="license_details" className="mb-2 font-medium">License Details</Label>
                        <Textarea
                          id="license_details"
                          value={formData.license_details}
                          onChange={(e) => setFormData(prev => ({ ...prev, license_details: e.target.value }))}
                          placeholder="License requirements and details..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distances Tab */}
          <TabsContent value="distances" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Event Distances
                </CardTitle>
                <CardDescription>
                  Define the different distances participants can choose from
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errors.distances && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.distances}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {formData.distances.map((distance, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDistance(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`distance_${index}_name`} className="mb-2 font-medium">Distance Name *</Label>
                            <Input
                              id={`distance_${index}_name`}
                              value={distance.name}
                              onChange={(e) => updateDistance(index, 'name', e.target.value)}
                              placeholder="e.g., 5km Fun Run"
                              className={errors[`distance_${index}_name`] ? 'border-red-500' : ''}
                            />
                            {errors[`distance_${index}_name`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`distance_${index}_name`]}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_distance`} className="mb-2 font-medium">Distance (km) *</Label>
                            <Input
                              id={`distance_${index}_distance`}
                              type="number"
                              min="0"
                              step="0.1"
                              value={distance.distance_km || ''}
                              onChange={(e) => updateDistance(index, 'distance_km', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className={errors[`distance_${index}_distance`] ? 'border-red-500' : ''}
                            />
                            {errors[`distance_${index}_distance`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`distance_${index}_distance`]}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_price`} className="mb-2 font-medium">Price (R) *</Label>
                            <Input
                              id={`distance_${index}_price`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={distance.price || ''}
                              onChange={(e) => updateDistance(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={errors[`distance_${index}_price`] ? 'border-red-500' : ''}
                            />
                            {errors[`distance_${index}_price`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`distance_${index}_price`]}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_min_age`} className="mb-2 font-medium">Minimum Age</Label>
                            <Input
                              id={`distance_${index}_min_age`}
                              type="number"
                              min="0"
                              value={distance.min_age || ''}
                              onChange={(e) => updateDistance(index, 'min_age', e.target.value ? parseInt(e.target.value) : undefined)}
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
                              onChange={(e) => updateDistance(index, 'entry_limit', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="No limit"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`distance_${index}_start_time`} className="mb-2 font-medium">Start Time</Label>
                            <Input
                              id={`distance_${index}_start_time`}
                              type="time"
                              value={distance.start_time || ''}
                              onChange={(e) => updateDistance(index, 'start_time', e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`distance_${index}_free_seniors`}
                              checked={distance.free_for_seniors}
                              onChange={(e) => updateDistance(index, 'free_for_seniors', e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`distance_${index}_free_seniors`}>Free for seniors</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`distance_${index}_free_disability`}
                              checked={distance.free_for_disability}
                              onChange={(e) => updateDistance(index, 'free_for_disability', e.target.checked)}
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
                              value={distance.senior_age_threshold || 65}
                              onChange={(e) => updateDistance(index, 'senior_age_threshold', parseInt(e.target.value) || 65)}
                              placeholder="65"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDistance}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Distance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Merchandise Tab */}
          <TabsContent value="merchandise" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Event Merchandise
                </CardTitle>
                <CardDescription>
                  Add merchandise items participants can purchase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.merchandise.map((merch, merchIndex) => (
                    <Card key={merchIndex} className="relative">
                      <CardContent className="pt-6">
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMerchandise(merchIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`merch_${merchIndex}_name`} className="mb-2 font-medium">Item Name *</Label>
                            <Input
                              id={`merch_${merchIndex}_name`}
                              value={merch.name}
                              onChange={(e) => updateMerchandise(merchIndex, 'name', e.target.value)}
                              placeholder="e.g., Event T-Shirt"
                              className={errors[`merch_${merchIndex}_name`] ? 'border-red-500' : ''}
                            />
                            {errors[`merch_${merchIndex}_name`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`merch_${merchIndex}_name`]}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`merch_${merchIndex}_price`} className="mb-2 font-medium">Price (R) *</Label>
                            <Input
                              id={`merch_${merchIndex}_price`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={merch.price || ''}
                              onChange={(e) => updateMerchandise(merchIndex, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={errors[`merch_${merchIndex}_price`] ? 'border-red-500' : ''}
                            />
                            {errors[`merch_${merchIndex}_price`] && (
                              <p className="text-sm text-red-500 mt-1">{errors[`merch_${merchIndex}_price`]}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor={`merch_${merchIndex}_description`} className="mb-2 font-medium">Description</Label>
                          <Textarea
                            id={`merch_${merchIndex}_description`}
                            value={merch.description}
                            onChange={(e) => updateMerchandise(merchIndex, 'description', e.target.value)}
                            placeholder="Describe the merchandise item..."
                            rows={3}
                          />
                        </div>

                        {/* Merchandise Image */}
                        <div className="mt-4">
                          <Label className="mb-2 font-medium">Item Image</Label>
                          <div className="mt-2">
                            {merch.image_url ? (
                              <div className="relative w-32 h-32">
                                <img
                                  src={merch.image_url}
                                  alt="Merchandise"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => updateMerchandise(merchIndex, 'image_url', '')}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={uploading}
                                  onClick={() => {
                                    const input = document.createElement('input')
                                    input.type = 'file'
                                    input.accept = 'image/*'
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0]
                                      if (file) handleMerchandiseImageUpload(file, merchIndex)
                                    }
                                    input.click()
                                  }}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Variations */}
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium mb-2">Variations</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addMerchandiseVariation(merchIndex)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Variation
                            </Button>
                          </div>

                          {merch.variations.map((variation, variationIndex) => (
                            <Card key={variationIndex} className="bg-gray-50">
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <Input
                                    value={variation.name}
                                    onChange={(e) => updateMerchandiseVariation(merchIndex, variationIndex, 'name', e.target.value)}
                                    placeholder="Variation name (e.g., Size, Color)"
                                    className="flex-1 mr-2"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeMerchandiseVariation(merchIndex, variationIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Options</Label>
                                  {(variation.options || []).map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateVariationOption(merchIndex, variationIndex, optionIndex, e.target.value)}
                                        placeholder="Option value"
                                        className="flex-1"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeVariationOption(merchIndex, variationIndex, optionIndex)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addVariationOption(merchIndex, variationIndex)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMerchandise}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Merchandise
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Progressive Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            
            {!isFirstTab && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousTab}
                className="flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            <span className="text-sm text-gray-500">
              Step {currentTabIndex + 1} of {tabs.length}
            </span>
            
            {!isLastTab ? (
              <Button
                type="button"
                onClick={goToNextTab}
                disabled={!isCurrentTabValid()}
                className="flex items-center gap-2"
              >
                Next
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  // Scroll to top to make the Create Event button visible
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="flex items-center gap-2"
                variant="outline"
              >
                Ready to Create
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
