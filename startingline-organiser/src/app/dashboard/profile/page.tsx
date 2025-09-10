'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { userApi } from '@/lib/supabase-api'
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
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await userApi.getProfile()
      if (response.success && response.data) {
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          company_name: response.data.company_name || '',
          company_address: response.data.company_address || '',
          vat_number: response.data.vat_number || '',
          company_registration_number: response.data.company_registration_number || '',
          company_phone: response.data.company_phone || '',
          company_email: response.data.company_email || '',
          bank_name: response.data.bank_name || '',
          account_holder_name: response.data.account_holder_name || '',
          account_number: response.data.account_number || '',
          branch_code: response.data.branch_code || '',
          account_type: response.data.account_type || ''
        })
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
      const response = await userApi.updateProfile(dataToUpdate)
      if (response.success) {
        setSuccessMessage('Profile updated successfully!')
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrors({ general: response.error || 'Failed to update profile' })
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
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your organiser profile and account details</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking Details
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your personal contact details used for organiser communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={errors.first_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className={errors.last_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      required
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      className={errors.phone ? 'border-red-500' : ''}
                      required
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Information Tab */}
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Business details for official communications and registrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={profileData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className={errors.company_name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.company_name && <p className="text-sm text-red-600 mt-1">{errors.company_name}</p>}
                  </div>


                  <div className="md:col-span-2">
                    <Label htmlFor="company_address">Company Address *</Label>
                    <Input
                      id="company_address"
                      value={profileData.company_address}
                      onChange={(e) => handleInputChange('company_address', e.target.value)}
                      placeholder="Full company address"
                      className={errors.company_address ? 'border-red-500' : ''}
                      required
                    />
                    {errors.company_address && <p className="text-sm text-red-600 mt-1">{errors.company_address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="company_phone">Company Phone</Label>
                    <Input
                      id="company_phone"
                      value={profileData.company_phone}
                      onChange={(e) => handleInputChange('company_phone', e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      className={errors.company_phone ? 'border-red-500' : ''}
                    />
                    {errors.company_phone && <p className="text-sm text-red-600 mt-1">{errors.company_phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="company_email">Company Email</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={profileData.company_email}
                      onChange={(e) => handleInputChange('company_email', e.target.value)}
                      placeholder="info@company.com"
                      className={errors.company_email ? 'border-red-500' : ''}
                    />
                    {errors.company_email && <p className="text-sm text-red-600 mt-1">{errors.company_email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="vat_number">VAT Number</Label>
                    <Input
                      id="vat_number"
                      value={profileData.vat_number}
                      onChange={(e) => handleInputChange('vat_number', e.target.value)}
                      placeholder="4XXXXXXXXX"
                      className={errors.vat_number ? 'border-red-500' : ''}
                    />
                    {errors.vat_number && <p className="text-sm text-red-600 mt-1">{errors.vat_number}</p>}
                  </div>

                  <div>
                    <Label htmlFor="company_registration_number">Company Registration</Label>
                    <Input
                      id="company_registration_number"
                      value={profileData.company_registration_number}
                      onChange={(e) => handleInputChange('company_registration_number', e.target.value)}
                      placeholder="CK/XXXXXXXXXX"
                      className={errors.company_registration_number ? 'border-red-500' : ''}
                    />
                    {errors.company_registration_number && <p className="text-sm text-red-600 mt-1">{errors.company_registration_number}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Details Tab */}
          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Details
                </CardTitle>
                <CardDescription>
                  Banking information for event payouts and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your banking details are securely stored and only used for payment processing and payouts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={profileData.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      placeholder="e.g., Standard Bank, FNB, ABSA"
                      className={errors.bank_name ? 'border-red-500' : ''}
                    />
                    {errors.bank_name && <p className="text-sm text-red-600 mt-1">{errors.bank_name}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="account_holder_name">Account Holder Name</Label>
                    <Input
                      id="account_holder_name"
                      value={profileData.account_holder_name}
                      onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                      placeholder="Full name as it appears on bank account"
                      className={errors.account_holder_name ? 'border-red-500' : ''}
                    />
                    {errors.account_holder_name && <p className="text-sm text-red-600 mt-1">{errors.account_holder_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={profileData.account_number}
                      onChange={(e) => handleInputChange('account_number', e.target.value)}
                      placeholder="Bank account number"
                      className={errors.account_number ? 'border-red-500' : ''}
                    />
                    {errors.account_number && <p className="text-sm text-red-600 mt-1">{errors.account_number}</p>}
                  </div>

                  <div>
                    <Label htmlFor="branch_code">Branch Code</Label>
                    <Input
                      id="branch_code"
                      value={profileData.branch_code}
                      onChange={(e) => handleInputChange('branch_code', e.target.value)}
                      placeholder="6-digit branch code"
                      className={errors.branch_code ? 'border-red-500' : ''}
                    />
                    {errors.branch_code && <p className="text-sm text-red-600 mt-1">{errors.branch_code}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="account_type">Account Type</Label>
                    <select
                      id="account_type"
                      value={profileData.account_type}
                      onChange={(e) => handleInputChange('account_type', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.account_type ? 'border-red-500' : ''}`}
                    >
                      <option value="" disabled>
                        Select Account Type
                      </option>
                      {ACCOUNT_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    {errors.account_type && <p className="text-sm text-red-600 mt-1">{errors.account_type}</p>}
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 mt-8">
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
