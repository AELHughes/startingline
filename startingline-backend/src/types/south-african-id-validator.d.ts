declare module 'south-african-id-validator' {
  /**
   * Validates a South African ID number
   * @param idNumber - The 13-digit South African ID number as a string
   * @returns boolean - true if the ID number is valid, false otherwise
   */
  export function validateSouthAfricanId(idNumber: string): boolean

  /**
   * Extracts the date of birth from a South African ID number
   * @param idNumber - The 13-digit South African ID number as a string
   * @returns Date - The date of birth extracted from the ID number
   */
  export function extractDateOfBirth(idNumber: string): Date

  /**
   * Extracts gender from a South African ID number
   * @param idNumber - The 13-digit South African ID number as a string
   * @returns string - 'male' or 'female'
   */
  export function extractGender(idNumber: string): 'male' | 'female'

  /**
   * Extracts citizenship status from a South African ID number
   * @param idNumber - The 13-digit South African ID number as a string
   * @returns string - 'citizen' or 'permanent_resident'
   */
  export function extractCitizenship(idNumber: string): 'citizen' | 'permanent_resident'
}

