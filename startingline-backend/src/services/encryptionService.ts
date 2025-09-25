import crypto from 'crypto'

// Use environment variable for encryption key
const ENCRYPTION_KEY = process.env.ID_ENCRYPTION_KEY || 'default-key-change-in-production-32-chars'
const ALGORITHM = 'aes-256-gcm'

export interface EncryptedData {
  encryptedData: string
  iv: string
  authTag: string
}

/**
 * Encrypt sensitive data like ID numbers
 */
export function encryptIdNumber(idNumber: string): EncryptedData {
  if (!idNumber) {
    throw new Error('ID number is required for encryption')
  }

  // Generate a random initialization vector
  const iv = crypto.randomBytes(16)
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv)
  cipher.setAAD(Buffer.from('id-number'))
  
  // Encrypt the data
  let encrypted = cipher.update(idNumber, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag()

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

/**
 * Decrypt ID number
 */
export function decryptIdNumber(encryptedData: EncryptedData): string {
  if (!encryptedData.encryptedData || !encryptedData.iv || !encryptedData.authTag) {
    throw new Error('Invalid encrypted data format')
  }

  try {
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), Buffer.from(encryptedData.iv, 'hex'))
    decipher.setAAD(Buffer.from('id-number'))
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt ID number')
  }
}

/**
 * Create a hash for ID number (for searching/indexing without decryption)
 */
export function hashIdNumber(idNumber: string): string {
  if (!idNumber) {
    throw new Error('ID number is required for hashing')
  }

  // Use HMAC for consistent hashing
  const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
  hmac.update(idNumber)
  return hmac.digest('hex')
}

/**
 * Mask ID number for display (show first 6 and last 2 digits for SA ID)
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
 * Validate encryption key strength
 */
export function validateEncryptionKey(): boolean {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY === 'default-key-change-in-production-32-chars') {
    console.warn('⚠️  Using default encryption key. Set ID_ENCRYPTION_KEY environment variable in production!')
    return false
  }
  
  if (ENCRYPTION_KEY.length < 32) {
    console.error('❌ Encryption key must be at least 32 characters long')
    return false
  }
  
  return true
}

// Validate key on module load
validateEncryptionKey()
