'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateSAMobileNumber, formatMobileInput } from '@/lib/validation'
import { Phone, CheckCircle, AlertCircle } from 'lucide-react'

interface MobileInputProps {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean, error?: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
  showValidation?: boolean
}

export function MobileInput({
  id = 'mobile',
  label = 'Mobile Number',
  value,
  onChange,
  onValidationChange,
  placeholder = '082 123 4567',
  required = false,
  className = '',
  disabled = false,
  showValidation = true
}: MobileInputProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: true })
  const [touched, setTouched] = useState(false)
  const lastValidationRef = useRef<{ isValid: boolean; error?: string }>({ isValid: true })

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  // Validate on value change
  useEffect(() => {
    let newValidation: { isValid: boolean; error?: string }
    
    if (value && touched) {
      newValidation = validateSAMobileNumber(value)
    } else if (!value && required && touched) {
      newValidation = { isValid: false, error: 'Mobile number is required' }
    } else {
      newValidation = { isValid: true }
    }
    
    // Only update state and call callback if validation actually changed
    if (newValidation.isValid !== lastValidationRef.current.isValid || 
        newValidation.error !== lastValidationRef.current.error) {
      setValidation(newValidation)
      lastValidationRef.current = newValidation
      onValidationChange?.(newValidation.isValid, newValidation.error)
    }
  }, [value, touched, required, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatMobileInput(inputValue)
    setDisplayValue(formatted)
    
    // Store the clean value (remove formatting)
    const cleanValue = inputValue.replace(/[\s\-\(\)]/g, '')
    onChange(cleanValue)
  }

  const handleBlur = () => {
    setTouched(true)
    // Format the final value
    if (value) {
      const result = validateSAMobileNumber(value)
      if (result.isValid && result.formatted) {
        const formatted = formatMobileInput(result.formatted)
        setDisplayValue(formatted)
        onChange(result.formatted)
      }
    }
  }

  const getValidationIcon = () => {
    if (!showValidation || !touched || !value) return null
    
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getInputClassName = () => {
    let baseClass = `pl-10 pr-10 ${className}`
    
    if (showValidation && touched && value) {
      if (validation.isValid) {
        baseClass += ' border-green-500 focus:border-green-500'
      } else {
        baseClass += ' border-red-500 focus:border-red-500'
      }
    }
    
    return baseClass
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          id={id}
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={getInputClassName()}
          disabled={disabled}
          maxLength={15} // Max length for formatted number
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>
      
      {showValidation && touched && !validation.isValid && validation.error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validation.error}
        </p>
      )}
      
      {showValidation && !touched && (
        <p className="text-xs text-gray-500">
          Format: 082 123 4567 or +27 82 123 4567
        </p>
      )}
    </div>
  )
}
