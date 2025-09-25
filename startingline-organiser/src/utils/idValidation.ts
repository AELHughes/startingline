// @ts-ignore - No type definitions available for this module
import { validateIdNumber, parseDOB, parseGender, parseCitizenship } from 'south-african-id-validator'

export interface IdValidationResult {
  isValid: boolean
  type: 'sa_id' | 'passport' | 'unknown'
  dateOfBirth?: Date
  gender?: 'male' | 'female'
  citizenship?: 'citizen' | 'permanent_resident'
  error?: string
}

export interface PassportValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate South African ID number and extract information
 */
export function validateSouthAfricanIdNumber(idNumber: string): IdValidationResult {
  // Remove spaces and convert to uppercase
  const cleanId = idNumber.replace(/\s/g, '').toUpperCase()
  
  // Check if it's a valid SA ID format (13 digits)
  if (!/^\d{13}$/.test(cleanId)) {
    return {
      isValid: false,
      type: 'unknown',
      error: 'South African ID must be exactly 13 digits'
    }
  }

  try {
    // Use the library to validate
    const validationResult = validateIdNumber(cleanId)
    
    if (!validationResult.valid) {
      return {
        isValid: false,
        type: 'sa_id',
        error: 'Invalid South African ID number'
      }
    }

    // Extract date of birth
    const dateOfBirth = parseDOB(cleanId)
    
    // Extract gender
    const gender = parseGender(cleanId) === 'male' ? 'male' : 'female'
    
    // Extract citizenship
    const isCitizen = parseCitizenship(cleanId)
    const citizenship = isCitizen ? 'citizen' : 'permanent_resident'

    return {
      isValid: true,
      type: 'sa_id',
      dateOfBirth,
      gender,
      citizenship
    }
  } catch (error) {
    return {
      isValid: false,
      type: 'sa_id',
      error: 'Failed to validate ID number'
    }
  }
}

/**
 * Basic passport number validation
 */
export function validatePassportNumber(passportNumber: string): PassportValidationResult {
  // Remove spaces and convert to uppercase
  const cleanPassport = passportNumber.replace(/\s/g, '').toUpperCase()
  
  // Basic passport validation (6-9 alphanumeric characters)
  if (!/^[A-Z0-9]{6,9}$/.test(cleanPassport)) {
    return {
      isValid: false,
      error: 'Passport number must be 6-9 alphanumeric characters'
    }
  }

  return {
    isValid: true
  }
}

/**
 * Determine document type and validate accordingly
 */
export function validateIdentityDocument(documentNumber: string): IdValidationResult {
  const cleanDoc = documentNumber.replace(/\s/g, '').toUpperCase()
  
  // Check if it looks like a SA ID (13 digits)
  if (/^\d{13}$/.test(cleanDoc)) {
    return validateSouthAfricanIdNumber(cleanDoc)
  }
  
  // Check if it looks like a passport (6-9 alphanumeric)
  if (/^[A-Z0-9]{6,9}$/.test(cleanDoc)) {
    const passportResult = validatePassportNumber(cleanDoc)
    return {
      isValid: passportResult.isValid,
      type: 'passport',
      error: passportResult.error
    }
  }
  
  return {
    isValid: false,
    type: 'unknown',
    error: 'Document must be a valid South African ID (13 digits) or Passport (6-9 alphanumeric characters)'
  }
}

/**
 * Format ID number for display (mask middle digits)
 */
export function maskIdNumber(idNumber: string): string {
  if (!idNumber) return ''
  
  const clean = idNumber.replace(/\s/g, '')
  
  if (clean.length === 13) {
    // SA ID: Show first 6 and last 2 digits
    return `${clean.substring(0, 6)}*****${clean.substring(11)}`
  } else {
    // Passport: Show first 3 and last 2 characters
    const masked = '*'.repeat(Math.max(0, clean.length - 5))
    return `${clean.substring(0, 3)}${masked}${clean.substring(clean.length - 2)}`
  }
}

/**
 * Format date for form input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if extracted DOB matches provided DOB (within 1 day tolerance)
 */
export function validateDateOfBirthMatch(extractedDob: Date, providedDob: string): boolean {
  try {
    const provided = new Date(providedDob)
    const timeDiff = Math.abs(extractedDob.getTime() - provided.getTime())
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    
    // Allow 1 day tolerance for timezone/parsing differences
    return daysDiff <= 1
  } catch {
    return false
  }
}
