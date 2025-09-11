'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Valid account types based on database constraint
const ACCOUNT_TYPES = [
  'cheque',
  'savings'
]
import { Badge } from '@/components/ui/badge'
import { User, Building, CreditCard, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface ProfileData {
  // Basic Info
  first_name: string
  last_name: string
  email: string
  phone: string
  
  // Company Info
  company_name: string
  company_address: string
  vat_number: string
  company_registration_number: string
  company_phone: string
  company_email: string
  
  // Banking Details
  bank_name: string
  account_holder_name: string
  account_number: string
  branch_code: string
  account_type: string
}


export default function ProfilePage() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    company_address: '',
    vat_number: '',
    company_registration_number: '',
    company_phone: '',
    company_email: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    branch_code: '',
    account_type: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    console.log('👤 User from auth context:', user)
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching profile data...')
      const profileData = await userApi.getProfile()
      console.log('📦 Profile data received:', profileData)
      if (profileData) {
        console.log('✅ Setting profile data in state...')
        setProfileData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          company_name: profileData.company_name || '',
          company_address: profileData.company_address || '',
          vat_number: profileData.vat_number || '',
          company_registration_number: profileData.company_registration_number || '',
          company_phone: profileData.company_phone || '',
          company_email: profileData.company_email || '',
          bank_name: profileData.bank_name || '',
          account_holder_name: profileData.account_holder_name || '',
          account_number: profileData.account_number || '',
          branch_code: profileData.branch_code || '',
          account_type: profileData.account_type || ''
        })
        console.log('🎯 Profile data set in state successfully!')
      } else {
        console.error('❌ No profile data received')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setErrors({ general: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccessMessage('')
    setSaving(true)

    try {
      // Filter out empty values to prevent constraint violations
      const dataToUpdate = { ...profileData }
      
      // Remove empty or potentially problematic fields
      if (!dataToUpdate.bank_name || dataToUpdate.bank_name === '') {
        delete dataToUpdate.bank_name
      }
      if (!dataToUpdate.account_holder_name || dataToUpdate.account_holder_name === '') {
        delete dataToUpdate.account_holder_name
      }
      if (!dataToUpdate.account_number || dataToUpdate.account_number === '') {
        delete dataToUpdate.account_number
      }
      if (!dataToUpdate.branch_code || dataToUpdate.branch_code === '') {
        delete dataToUpdate.branch_code
      }
      if (!dataToUpdate.account_type || dataToUpdate.account_type === '') {
        delete dataToUpdate.account_type
      }

      console.log('Sending profile data:', dataToUpdate)
      const updatedProfile = await userApi.updateProfile(dataToUpdate)
      console.log('Profile update response:', updatedProfile)
      if (updatedProfile) {
        setSuccessMessage('Profile updated successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: 'Failed to update profile' })
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ general: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your business profile and payment information</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user?.role}
        </Badge>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{errors.general}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your personal contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                      placeholder="Enter your first name"
                    />
                    {errors.first_name && (
                      <p className="text-red-500 text-sm">{errors.first_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                      placeholder="Enter your last name"
                    />
                    {errors.last_name && (
                      <p className="text-red-500 text-sm">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Business details for invoicing and legal purposes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter your company name"
                  />
                  {errors.company_name && (
                    <p className="text-red-500 text-sm">{errors.company_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">Company Address</Label>
                  <Input
                    id="company_address"
                    type="text"
                    value={profileData.company_address}
                    onChange={(e) => handleInputChange('company_address', e.target.value)}
                    placeholder="Enter your company address"
                  />
                  {errors.company_address && (
                    <p className="text-red-500 text-sm">{errors.company_address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vat_number">VAT Number</Label>
                    <Input
                      id="vat_number"
                      type="text"
                      value={profileData.vat_number}
                      onChange={(e) => handleInputChange('vat_number', e.target.value)}
                      placeholder="Enter VAT number"
                    />
                    {errors.vat_number && (
                      <p className="text-red-500 text-sm">{errors.vat_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_registration_number">Registration Number</Label>
                    <Input
                      id="company_registration_number"
                      type="text"
                      value={profileData.company_registration_number}
                      onChange={(e) => handleInputChange('company_registration_number', e.target.value)}
                      placeholder="Enter company registration"
                    />
                    {errors.company_registration_number && (
                      <p className="text-red-500 text-sm">{errors.company_registration_number}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Company Phone</Label>
                    <Input
                      id="company_phone"
                      type="tel"
                      value={profileData.company_phone}
                      onChange={(e) => handleInputChange('company_phone', e.target.value)}
                      placeholder="Enter company phone"
                    />
                    {errors.company_phone && (
                      <p className="text-red-500 text-sm">{errors.company_phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_email">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={profileData.company_email}
                      onChange={(e) => handleInputChange('company_email', e.target.value)}
                      placeholder="Enter company email"
                    />
                    {errors.company_email && (
                      <p className="text-red-500 text-sm">{errors.company_email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle>Banking Details</CardTitle>
                <CardDescription>
                  Payment information for event proceeds and refunds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    type="text"
                    value={profileData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                    placeholder="Enter bank name"
                  />
                  {errors.bank_name && (
                    <p className="text-red-500 text-sm">{errors.bank_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_holder_name">Account Holder Name</Label>
                  <Input
                    id="account_holder_name"
                    type="text"
                    value={profileData.account_holder_name}
                    onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                    placeholder="Enter account holder name"
                  />
                  {errors.account_holder_name && (
                    <p className="text-red-500 text-sm">{errors.account_holder_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      type="text"
                      value={profileData.account_number}
                      onChange={(e) => handleInputChange('account_number', e.target.value)}
                      placeholder="Enter account number"
                    />
                    {errors.account_number && (
                      <p className="text-red-500 text-sm">{errors.account_number}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch_code">Branch Code</Label>
                    <Input
                      id="branch_code"
                      type="text"
                      value={profileData.branch_code}
                      onChange={(e) => handleInputChange('branch_code', e.target.value)}
                      placeholder="Enter branch code"
                    />
                    {errors.branch_code && (
                      <p className="text-red-500 text-sm">{errors.branch_code}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <select
                    id="account_type"
                    value={profileData.account_type}
                    onChange={(e) => handleInputChange('account_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select account type</option>
                    {ACCOUNT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.account_type && (
                    <p className="text-red-500 text-sm">{errors.account_type}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}