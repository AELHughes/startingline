/**
 * South African mobile number validation utilities
 */

// Valid SA mobile prefixes (after the 0)
const SA_MOBILE_PREFIXES = [
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '71', '72', '73', '74', '76', '78', '79',
  '81', '82', '83', '84'
]

/**
 * Validates a South African mobile number
 * Accepts formats: +27123456789, 0123456789, 123456789
 */
export function validateSAMobileNumber(mobile: string): {
  isValid: boolean
  error?: string
  formatted?: string
} {
  if (!mobile) {
    return { isValid: false, error: 'Mobile number is required' }
  }

  // Remove all spaces, dashes, and other non-digit characters except +
  const cleaned = mobile.replace(/[\s\-\(\)]/g, '')
  
  // Check for valid formats
  let digits = ''
  
  if (cleaned.startsWith('+27')) {
    // International format: +27123456789
    digits = cleaned.substring(3)
    if (digits.length !== 9) {
      return { isValid: false, error: 'Invalid mobile number format. Expected +27 followed by 9 digits' }
    }
  } else if (cleaned.startsWith('0')) {
    // Local format: 0123456789
    digits = cleaned.substring(1)
    if (digits.length !== 9) {
      return { isValid: false, error: 'Invalid mobile number format. Expected 0 followed by 9 digits' }
    }
  } else if (cleaned.match(/^\d{9}$/)) {
    // Just 9 digits: 123456789
    digits = cleaned
  } else {
    return { isValid: false, error: 'Invalid mobile number format. Use +27123456789 or 0123456789' }
  }

  // Check if all characters are digits
  if (!/^\d{9}$/.test(digits)) {
    return { isValid: false, error: 'Mobile number must contain only digits' }
  }

  // Check if the prefix is valid for SA mobile numbers
  const prefix = digits.substring(0, 2)
  if (!SA_MOBILE_PREFIXES.includes(prefix)) {
    return { 
      isValid: false, 
      error: `Invalid SA mobile prefix. Must start with: ${SA_MOBILE_PREFIXES.join(', ')}` 
    }
  }

  // Return valid result with formatted number
  const formatted = `0${digits}`
  return { 
    isValid: true, 
    formatted 
  }
}

/**
 * Formats a SA mobile number for display
 */
export function formatSAMobileNumber(mobile: string): string {
  const validation = validateSAMobileNumber(mobile)
  if (validation.isValid && validation.formatted) {
    const digits = validation.formatted.substring(1) // Remove the 0
    return `0${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`
  }
  return mobile
}

/**
 * Real-time mobile number formatting as user types
 */
export function formatMobileInput(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, '')
  
  if (cleaned.startsWith('+27')) {
    const digits = cleaned.substring(3)
    if (digits.length <= 2) return `+27 ${digits}`
    if (digits.length <= 5) return `+27 ${digits.substring(0, 2)} ${digits.substring(2)}`
    if (digits.length <= 9) return `+27 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`
    return `+27 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 9)}`
  } else if (cleaned.startsWith('0')) {
    const digits = cleaned.substring(1)
    if (digits.length <= 2) return `0${digits}`
    if (digits.length <= 5) return `0${digits.substring(0, 2)} ${digits.substring(2)}`
    if (digits.length <= 9) return `0${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`
    return `0${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 9)}`
  } else {
    // Assume local format without leading 0
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 5) return `${cleaned.substring(0, 2)} ${cleaned.substring(2)}`
    if (cleaned.length <= 9) return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 9)}`
  }
}
