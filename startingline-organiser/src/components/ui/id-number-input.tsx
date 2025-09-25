'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, User, FileText } from 'lucide-react'
import { validateIdentityDocument, formatDateForInput, IdValidationResult } from '@/utils/idValidation'

interface IdNumberInputProps {
  value: string
  onChange: (value: string) => void
  onValidationResult?: (result: IdValidationResult) => void
  onDateOfBirthExtracted?: (dateOfBirth: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function IdNumberInput({
  value,
  onChange,
  onValidationResult,
  onDateOfBirthExtracted,
  label = "ID Number / Passport",
  placeholder = "Enter SA ID number or Passport number",
  required = false,
  disabled = false,
  className = ""
}: IdNumberInputProps) {
  const [validationResult, setValidationResult] = useState<IdValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  // Debounced validation
  useEffect(() => {
    if (!value || value.length < 6) {
      setValidationResult(null)
      setShowValidation(false)
      return
    }

    setIsValidating(true)
    const timeoutId = setTimeout(() => {
      const result = validateIdentityDocument(value)
      setValidationResult(result)
      setShowValidation(true)
      setIsValidating(false)

      // Notify parent component
      if (onValidationResult) {
        onValidationResult(result)
      }

      // Auto-populate date of birth for SA ID
      if (result.isValid && result.type === 'sa_id' && result.dateOfBirth && onDateOfBirthExtracted) {
        const formattedDate = formatDateForInput(result.dateOfBirth)
        onDateOfBirthExtracted(formattedDate)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [value, onValidationResult, onDateOfBirthExtracted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    onChange(newValue)
  }

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
    }
    if (validationResult?.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (showValidation && !validationResult?.isValid) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getDocumentTypeIcon = () => {
    if (validationResult?.type === 'sa_id') {
      return <User className="h-4 w-4" />
    }
    if (validationResult?.type === 'passport') {
      return <FileText className="h-4 w-4" />
    }
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="id-number" className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="id-number"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${
            showValidation
              ? validationResult?.isValid
                ? 'border-green-500 focus:border-green-500'
                : 'border-red-500 focus:border-red-500'
              : ''
          }`}
          maxLength={13}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Document Type and Info Display */}
      {validationResult?.isValid && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {getDocumentTypeIcon()}
            {validationResult.type === 'sa_id' ? 'SA ID Number' : 'Passport'}
          </Badge>
          
          {validationResult.gender && (
            <Badge variant="outline">
              {validationResult.gender === 'male' ? 'Male' : 'Female'}
            </Badge>
          )}
          
          {validationResult.citizenship && (
            <Badge variant="outline">
              {validationResult.citizenship === 'citizen' ? 'SA Citizen' : 'Permanent Resident'}
            </Badge>
          )}
        </div>
      )}

      {/* Date of Birth Auto-Population Notice */}
      {validationResult?.isValid && validationResult.type === 'sa_id' && validationResult.dateOfBirth && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Date of birth automatically populated from ID number: {' '}
            <strong>{validationResult.dateOfBirth.toLocaleDateString()}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Error */}
      {showValidation && !validationResult?.isValid && validationResult?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationResult.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Enter your South African ID number (13 digits) or Passport number (6-9 characters).
        {validationResult?.type === 'sa_id' && ' Your date of birth will be automatically filled.'}
      </p>
    </div>
  )
}

