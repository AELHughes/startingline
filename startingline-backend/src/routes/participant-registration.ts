import express, { Request, Response, NextFunction } from 'express'
import { pool } from '../lib/database'
import { authenticateToken, optionalAuth } from '../middleware/auth-local'
import { ApiResponse } from '../types'
import { emailService } from '../services/emailService'
import { encryptIdNumber, hashIdNumber, maskIdNumber, decryptIdNumber } from '../services/encryptionService'
// @ts-ignore - No type definitions available for this module
import { validateIdNumber, parseDOB } from 'south-african-id-validator'

const router = express.Router()

// Types for participant registration
interface ParticipantData {
  first_name: string
  last_name: string
  email: string
  mobile: string
  date_of_birth: string
  disabled?: boolean
  medical_aid_name?: string
  medical_aid_number?: string
  emergency_contact_name: string
  emergency_contact_number: string
  requires_temp_license?: boolean
  permanent_license_number?: string
  id_document_number?: string
  id_document_type?: 'sa_id' | 'passport'
  gender?: 'male' | 'female'
  citizenship_status?: 'citizen' | 'permanent_resident'
  merchandise?: Array<{
    merchandise_id: string
    variation_id?: string // Keep for backward compatibility  
    variation_option_id?: string // New field for proper variation tracking
    quantity: number
    unit_price: number
  }>
}

interface OrderData {
  event_id: string
  account_holder_first_name: string
  account_holder_last_name: string
  account_holder_email: string
  account_holder_mobile: string
  account_holder_company?: string
  account_holder_address: string
  emergency_contact_name: string
  emergency_contact_number: string
  account_holder_password?: string
  license_fees?: number
  participants: Array<{
    distance_id: string
    adjusted_price?: number
    participant: ParticipantData
  }>
}

/**
 * Check if email is already associated with an existing account
 */
router.post('/check-email-exists', async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      } as ApiResponse)
    }

    // Check if email exists in users table
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    const exists = result.rows.length > 0
    const user = exists ? result.rows[0] : null

    res.json({
      success: true,
      data: {
        exists,
        user: user ? {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        } : null
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('Check email exists error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check email'
    } as ApiResponse)
  }
})

/**
 * Test email functionality
 */
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing email functionality...')
    
    const testEmailData: any = {
      participantName: 'Test User',
      participantEmail: 'elownehughes@gmail.com',
      eventName: 'Test Event',
      eventDate: '2025-09-20',
      eventTime: '08:00',
      eventLocation: 'Test Location',
      distanceName: '5K',
      ticketNumber: 'TEST-001',
      organizerName: 'Test Organizer',
      organizerLogo: undefined,
      eventSlug: 'test-event',
      orderId: 'test-order-123',
      ticketPDF: undefined
    }

    // Test PDF generation
    try {
      console.log('📄 Testing PDF generation...')
      const { generatePDFTicket } = require('../lib/pdfGenerator')
      const pdfBuffer = await generatePDFTicket({
        ticketNumber: testEmailData.ticketNumber,
        participantName: testEmailData.participantName,
        participantEmail: testEmailData.participantEmail,
        participantMobile: '1234567890',
        eventName: testEmailData.eventName,
        eventDate: testEmailData.eventDate,
        eventTime: testEmailData.eventTime,
        eventLocation: testEmailData.eventLocation,
        distanceName: testEmailData.distanceName,
        distancePrice: 50.00,
        organizerName: testEmailData.organizerName,
        organizerLogo: testEmailData.organizerLogo
      })
      
      testEmailData.ticketPDF = pdfBuffer
      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    } catch (pdfError: any) {
      console.error('❌ PDF generation failed:', pdfError)
      if (pdfError instanceof Error) {
        console.error('❌ PDF Error details:', pdfError.message)
      }
    }

    // Test email sending
    console.log('📧 Testing email sending...')
    const emailSent = await emailService.sendEventRegistrationEmail(testEmailData)
    
    if (emailSent) {
      console.log('✅ Test email sent successfully')
      res.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          pdfGenerated: !!testEmailData.ticketPDF,
          pdfSize: testEmailData.ticketPDF ? testEmailData.ticketPDF.length : 0
        }
      } as ApiResponse)
    } else {
      console.error('❌ Test email failed to send')
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      } as ApiResponse)
    }

  } catch (error: any) {
    console.error('Test email error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test email'
    } as ApiResponse)
  }
})

/**
 * Check if a participant is already registered for an event
 */
router.post('/check-participant-registration', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Check participant registration request:', req.body)
    const { event_id, email, first_name, last_name, date_of_birth } = req.body

    if (!event_id || !email || !first_name || !last_name || !date_of_birth) {
      console.log('❌ Missing required fields:', { event_id, email, first_name, last_name, date_of_birth })
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse)
    }

    // Check if participant exists in tickets table for this event
    const query = `
      WITH match_scores AS (
        SELECT 
          t.id,
          t.participant_first_name,
          t.participant_last_name,
          t.participant_email,
          t.participant_date_of_birth,
          ed.name as distance_name,
          (CASE WHEN LOWER(t.participant_email) = LOWER($2) THEN 1 ELSE 0 END) +
          (CASE WHEN LOWER(t.participant_first_name) = LOWER($3) THEN 1 ELSE 0 END) +
          (CASE WHEN LOWER(t.participant_last_name) = LOWER($4) THEN 1 ELSE 0 END) +
          (CASE WHEN t.participant_date_of_birth = $5 THEN 1 ELSE 0 END) as match_count
        FROM tickets t
        JOIN event_distances ed ON t.distance_id = ed.id
        WHERE t.event_id = $1 
        AND t.status = 'active'
      )
      SELECT *
      FROM match_scores
      WHERE match_count >= 3
    `
    console.log('🔍 Running query:', query)
    console.log('🔍 Query parameters:', [event_id, email, first_name, last_name])

    const result = await pool.query(query, [event_id, email, first_name, last_name, date_of_birth])
    console.log('🔍 Query result:', result.rows)

    const response = {
      success: true,
      data: {
        isRegistered: result.rows.length > 0,
        registrationDetails: result.rows[0] || null
      }
    } as ApiResponse

    console.log('✅ Sending response:', response)
    res.json(response)

  } catch (error: any) {
    console.error('Check participant registration error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check participant registration'
    } as ApiResponse)
  }
})

/**
 * Get event registration details (distances, pricing, merchandise)
 */
router.get('/event/:eventId/registration-details', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    // Get event details
    const eventResult = await pool.query(`
      SELECT 
        e.id, e.name, e.slug, e.category, e.start_date, e.start_time,
        e.venue_name, e.address, e.city, e.province, e.primary_image_url,
        e.license_required, e.license_type, e.temp_license_fee, e.license_details,
        e.free_for_disabled,
        o.first_name as organiser_first_name, o.last_name as organiser_last_name
      FROM events e
      LEFT JOIN users o ON e.organiser_id = o.id
      WHERE e.id = $1 AND e.status = 'published'
    `, [eventId])

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or not published'
      } as ApiResponse)
    }

    const event = eventResult.rows[0]

    // Get distances
    const distancesResult = await pool.query(`
      SELECT 
        id, name, distance_km, price, min_age, entry_limit, start_time,
        free_for_seniors, free_for_disability, senior_age_threshold
      FROM event_distances
      WHERE event_id = $1
      ORDER BY price ASC
    `, [eventId])

    // Get merchandise with new variation structure
    const merchandiseResult = await pool.query(`
      SELECT 
        em.id, em.name, em.description, em.price, em.image_url,
        COALESCE(
          json_agg(
            CASE WHEN mvt.id IS NOT NULL THEN
              json_build_object(
                'id', mvt.id,
                'variation_name', mvt.variation_name,
                'variation_options', mvt.variation_options
              )
            END
          ) FILTER (WHERE mvt.id IS NOT NULL),
          '[]'::json
        ) as variations
      FROM event_merchandise em
      LEFT JOIN (
        SELECT 
          mvt.*,
          json_agg(
            json_build_object(
              'id', mvo.id,
              'value', mvo.option_value,
              'stock', mvo.current_stock,
              'initial_stock', mvo.initial_stock
            )
            ORDER BY mvo.option_value
          ) as variation_options
        FROM merchandise_variation_types mvt
        LEFT JOIN merchandise_variation_options mvo ON mvt.id = mvo.variation_type_id
        GROUP BY mvt.id, mvt.merchandise_id, mvt.variation_name, mvt.created_at, mvt.updated_at
      ) mvt ON em.id = mvt.merchandise_id
      WHERE em.event_id = $1
      GROUP BY em.id, em.name, em.description, em.price, em.image_url
      ORDER BY em.name
    `, [eventId])

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          distances: distancesResult.rows,
          merchandise: merchandiseResult.rows
        }
      }
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get registration details error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get registration details'
    } as ApiResponse)
  }
})

/**
 * Validate participant age against distance requirements
 */
router.post('/validate-participant', async (req: Request, res: Response) => {
  try {
    const { distance_id, date_of_birth, disabled } = req.body

    // Get distance details
    const distanceResult = await pool.query(`
      SELECT 
        ed.min_age, ed.free_for_seniors, ed.free_for_disability, ed.senior_age_threshold,
        e.free_for_disabled
      FROM event_distances ed
      JOIN events e ON ed.event_id = e.id
      WHERE ed.id = $1
    `, [distance_id])

    if (distanceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Distance not found'
      } as ApiResponse)
    }

    const distance = distanceResult.rows[0]
    const birthDate = new Date(date_of_birth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    const validation = {
      age,
      min_age_met: age >= distance.min_age,
      is_free: false,
      reason: ''
    }

    // Check if participant qualifies for free entry
    if (disabled && distance.free_for_disabled) {
      validation.is_free = true
      validation.reason = 'Free entry for disabled participants'
    } else if (distance.free_for_seniors && age >= distance.senior_age_threshold) {
      validation.is_free = true
      validation.reason = 'Free entry for seniors'
    }

    res.json({
      success: true,
      data: validation
    } as ApiResponse)

  } catch (error: any) {
    console.error('Validate participant error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate participant'
    } as ApiResponse)
  }
})

// Removed duplicate route

/**
 * Save a participant for future use
 */
router.post('/save-participant', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.localUser!.userId
    const participantData = req.body
    
    console.log('🔍 Save participant - received data:', participantData)
    console.log('🔍 Save participant - first_name:', participantData.first_name)
    console.log('🔍 Save participant - last_name:', participantData.last_name)

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Process ID document if provided
    let idDocumentEncrypted = null
    let idDocumentIv = null
    let idDocumentAuthTag = null
    let idDocumentHash = null
    
    if (participantData.id_document_number) {
      try {
        // Validate SA ID if applicable
        if (participantData.id_document_type === 'sa_id') {
          const validationResult = validateIdNumber(participantData.id_document_number)
          if (!validationResult.valid) {
            return res.status(400).json({
              success: false,
              error: 'Invalid South African ID number'
            } as ApiResponse)
          }
        }
        
        // Encrypt the ID number
        const encrypted = encryptIdNumber(participantData.id_document_number)
        idDocumentEncrypted = encrypted.encryptedData
        idDocumentIv = encrypted.iv
        idDocumentAuthTag = encrypted.authTag
        
        // Create hash for searching
        idDocumentHash = hashIdNumber(participantData.id_document_number)
        
        console.log(`✅ ID document processed for participant ${participantData.first_name} ${participantData.last_name}`)
      } catch (error) {
        console.error('❌ ID document processing error:', error)
        return res.status(400).json({
          success: false,
          error: 'Failed to process ID document'
        } as ApiResponse)
      }
    }

    const result = await pool.query(`
      INSERT INTO saved_participants (
        user_profile_id, participant_first_name, participant_last_name, participant_email, participant_mobile, participant_date_of_birth,
        participant_medical_aid, participant_medical_aid_number, emergency_contact_name, emergency_contact_number,
        id_document_type, id_document_encrypted, id_document_iv, id_document_auth_tag, id_document_hash, gender, citizenship_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      userProfileId,
      participantData.first_name || participantData.participant_first_name,
      participantData.last_name || participantData.participant_last_name,
      participantData.email || participantData.participant_email,
      participantData.mobile || participantData.participant_mobile,
      participantData.date_of_birth || participantData.participant_date_of_birth,
      participantData.medical_aid_name || participantData.participant_medical_aid || null,
      participantData.medical_aid_number || participantData.participant_medical_aid_number || null,
      participantData.emergency_contact_name,
      participantData.emergency_contact_number,
      participantData.id_document_type || null,
      idDocumentEncrypted,
      idDocumentIv,
      idDocumentAuthTag,
      idDocumentHash,
      participantData.gender || null,
      participantData.citizenship_status || null
    ])

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Participant saved successfully'
    } as ApiResponse)

  } catch (error: any) {
    console.error('Save participant error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save participant'
    } as ApiResponse)
  }
})

/**
 * Create order and tickets for event registration
 */
router.post('/register', optionalAuth, async (req: Request, res: Response) => {
  const orderData: OrderData = req.body
  console.log('🚀 Registration request received')
  console.log('🔍 Request body keys:', Object.keys(req.body))
  console.log('🔍 req.localUser:', req.localUser)
  console.log('🔍 Request headers:', req.headers)
  console.log('Registration data received:', JSON.stringify(orderData, null, 2))
  let userId = req.localUser?.userId || null

  // STEP 1: Create user account FIRST (outside transaction to ensure it's committed)
  const client = await pool.connect()
  
  try {
    if (!userId && orderData.account_holder_email) {
      console.log('🔍 STEP 1: User creation check:')
      console.log('  - userId:', userId)
      console.log('  - account_holder_email:', orderData.account_holder_email)
      console.log('  - account_holder_first_name:', orderData.account_holder_first_name)
      console.log('  - account_holder_last_name:', orderData.account_holder_last_name)
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [orderData.account_holder_email]
      )
      
      console.log('🔍 Existing user check result:', existingUser.rows.length, 'rows found')
      
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id
        console.log('✅ User already exists, using existing ID:', userId)
        
        // Check if user profile exists
        const existingProfile = await client.query(
          'SELECT id FROM user_profiles WHERE user_id = $1',
          [userId]
        )
        
        if (existingProfile.rows.length === 0) {
          console.log('🔍 STEP 1B: Creating missing user profile for existing user...')
          const userProfileResult = await client.query(`
            INSERT INTO user_profiles (
              user_id, email, first_name, last_name, phone, address, 
              emergency_contact_name, emergency_contact_number, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id
          `, [
            userId,
            orderData.account_holder_email,
            orderData.account_holder_first_name,
            orderData.account_holder_last_name,
            orderData.account_holder_mobile,
            orderData.account_holder_address,
            orderData.emergency_contact_name,
            orderData.emergency_contact_number
          ])
          
          const userProfileId = userProfileResult.rows[0].id
          console.log('✅ STEP 1B COMPLETE: Created missing user profile with ID:', userProfileId)
        } else {
          console.log('✅ User profile already exists')
        }
      } else {
        console.log('🆕 Creating new user account...')
        try {
          // Use the provided password from registration
          if (!orderData.account_holder_password) {
            throw new Error('Password is required for new account creation')
          }
          
          const bcrypt = require('bcrypt')
          const passwordHash = await bcrypt.hash(orderData.account_holder_password, 10)
          
          console.log('🔐 Generated password hash for participant')
          
          // Create new user (outside transaction to ensure immediate availability)
          const userResult = await client.query(`
            INSERT INTO users (
              email, password_hash, first_name, last_name, phone, role, email_verified, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'participant', true, NOW(), NOW())
            RETURNING id, email, first_name, last_name, role
          `, [
            orderData.account_holder_email,
            passwordHash,
            orderData.account_holder_first_name,
            orderData.account_holder_last_name,
            orderData.account_holder_mobile
          ])
          
          userId = userResult.rows[0].id
          console.log('✅ STEP 1A COMPLETE: Created new user with ID:', userId)
          console.log('✅ User details:', userResult.rows[0])
          
          // Create user profile for the new user
          console.log('🔍 STEP 1B: Creating user profile for new user...')
          const userProfileResult = await client.query(`
            INSERT INTO user_profiles (
              user_id, email, first_name, last_name, phone, address, 
              emergency_contact_name, emergency_contact_number, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id
          `, [
            userId,
            orderData.account_holder_email,
            orderData.account_holder_first_name,
            orderData.account_holder_last_name,
            orderData.account_holder_mobile,
            orderData.account_holder_address,
            orderData.emergency_contact_name,
            orderData.emergency_contact_number
          ])
          
          const userProfileId = userProfileResult.rows[0].id
          console.log('✅ STEP 1B COMPLETE: Created user profile with ID:', userProfileId)
        } catch (userError) {
          console.error('❌ Error creating user:', userError)
          throw userError
        }
      }
    } else {
      console.log('🔍 STEP 1 SKIPPED: User creation not needed:')
      console.log('  - userId:', userId)
      console.log('  - account_holder_email:', orderData.account_holder_email)
    }

    // STEP 2: Create event registration and save participants (within transaction)
    await client.query('BEGIN')
    console.log('🔍 STEP 2: Starting event registration transaction...')

    // Validate required fields
    if (!orderData.event_id || !orderData.participants || orderData.participants.length === 0) {
      await client.query('ROLLBACK')
      client.release()
      return res.status(400).json({
        success: false,
        error: 'Event ID and participants are required'
      } as ApiResponse)
    }

    // Check merchandise stock before processing
    console.log('🔍 Checking merchandise stock...')
    for (const participant of orderData.participants) {
      if (participant.participant.merchandise && participant.participant.merchandise.length > 0) {
        for (const item of participant.participant.merchandise) {
          // Get current stock
          const stockResult = await client.query(
            'SELECT current_stock FROM event_merchandise WHERE id = $1',
            [item.merchandise_id]
          )

          if (stockResult.rows.length === 0) {
            await client.query('ROLLBACK')
            client.release()
            return res.status(400).json({
              success: false,
              error: `Merchandise item ${item.merchandise_id} not found`
            } as ApiResponse)
          }

          const currentStock = stockResult.rows[0].current_stock
          if (currentStock < item.quantity) {
            await client.query('ROLLBACK')
            client.release()
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for merchandise item ${item.merchandise_id}`
            } as ApiResponse)
          }
        }
      }
    }

    // Check capacity for each distance before processing
    console.log('🔍 Checking capacity for all distances...')
    for (const item of orderData.participants) {
      console.log('🔍 Checking capacity for distance:', item.distance_id)
      
      // Get distance details with capacity information
      const distanceResult = await client.query(`
        SELECT 
          ed.*,
          ed.current_participants,
          ed.is_full,
          CASE 
            WHEN ed.entry_limit IS NULL OR ed.entry_limit = 0 THEN 'unlimited'
            WHEN ed.is_full THEN 'full'
            WHEN ed.current_participants >= (ed.entry_limit * 0.9) THEN 'almost_full'
            ELSE 'available'
          END as capacity_status,
          CASE 
            WHEN ed.entry_limit IS NULL OR ed.entry_limit = 0 THEN 0
            ELSE ed.entry_limit - ed.current_participants
          END as available_spots
        FROM event_distances ed 
        WHERE ed.id = $1
      `, [item.distance_id])
      
      if (distanceResult.rows.length === 0) {
        throw new Error(`Distance not found: ${item.distance_id}`)
      }
      
      const distance = distanceResult.rows[0]
      
      // Check if distance is full
      if (distance.capacity_status === 'full') {
        return res.status(400).json({
          success: false,
          error: `Distance "${distance.name}" is sold out. No spots available.`
        } as ApiResponse)
      }
      
      // Check if there are enough spots available
      if (distance.capacity_status !== 'unlimited' && distance.available_spots < 1) {
        return res.status(400).json({
          success: false,
          error: `Distance "${distance.name}" is full. Only ${distance.available_spots} spots available.`
        } as ApiResponse)
      }
      
      console.log(`✅ Capacity check passed for distance: ${distance.name}`)
    }

    // Calculate total amount
    let totalAmount = 0
    const ticketDetails = []

    for (const item of orderData.participants) {
      // Get distance details
      const distanceResult = await client.query(`
        SELECT 
          ed.price, ed.min_age, ed.free_for_seniors, ed.free_for_disability, ed.senior_age_threshold,
          e.free_for_disabled
        FROM event_distances ed
        JOIN events e ON ed.event_id = e.id
        WHERE ed.id = $1
      `, [item.distance_id])

      if (distanceResult.rows.length === 0) {
        throw new Error(`Distance ${item.distance_id} not found`)
      }

      const distance = distanceResult.rows[0]
      console.log('Distance price:', distance.price, 'Type:', typeof distance.price)
      const birthDate = new Date(item.participant.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      // Use adjusted price from frontend if provided, otherwise calculate here
      let ticketAmount = Number(distance.price)
      
      if (item.adjusted_price !== undefined) {
        // Frontend has already calculated the adjusted price
        ticketAmount = Number(item.adjusted_price)
        console.log('Using adjusted price from frontend:', ticketAmount)
      } else {
        // Fallback: calculate here (backward compatibility)
        let isFree = false
        if (item.participant.disabled && distance.free_for_disabled) {
          isFree = true
        } else if (distance.free_for_seniors && age >= distance.senior_age_threshold) {
          isFree = true
        }
        ticketAmount = isFree ? 0 : Number(distance.price)
        console.log('Calculated price on backend:', ticketAmount)
      }
      console.log('Ticket amount:', ticketAmount, 'Type:', typeof ticketAmount)
      totalAmount += ticketAmount
      console.log('Running total:', totalAmount, 'Type:', typeof totalAmount)

      ticketDetails.push({
        distance_id: item.distance_id,
        participant: item.participant,
        amount: ticketAmount,
        merchandise: item.participant.merchandise || []
      })
    }

    console.log('Calculated total amount:', totalAmount, 'Type:', typeof totalAmount)

    // STEP 2A: Validate merchandise stock before starting transaction
    console.log('🔍 STEP 2A: Validating merchandise stock')
    console.log('📦 Received merchandise data:', JSON.stringify(ticketDetails.map(t => t.merchandise), null, 2))
    
    for (const ticketDetail of ticketDetails) {
      for (const merch of ticketDetail.merchandise) {
        console.log(`🔍 Checking merchandise:`, {
          merchandise_id: merch.merchandise_id,
          variation_option_id: merch.variation_option_id,
          has_variation_option_id: !!merch.variation_option_id,
          quantity: merch.quantity
        })
        if (merch.variation_option_id) {
          // NEW STRUCTURE: Check stock for specific variation option
          const stockCheck = await client.query(`
            SELECT current_stock, option_value 
            FROM merchandise_variation_options mvo
            JOIN merchandise_variation_types mvt ON mvo.variation_type_id = mvt.id
            WHERE mvo.id = $1
          `, [merch.variation_option_id])
          
          if (stockCheck.rows.length === 0) {
            throw new Error(`Variation option ${merch.variation_option_id} not found`)
          }
          
          const { current_stock, option_value } = stockCheck.rows[0]
          if (current_stock < merch.quantity) {
            throw new Error(`Insufficient stock for ${option_value}. Available: ${current_stock}, Requested: ${merch.quantity}`)
          }
          
          console.log(`✅ Stock validation passed for ${option_value}: ${current_stock} >= ${merch.quantity} (using new variation structure)`)
        } else {
          // DEPRECATED: Only for merchandise without variations
          console.log(`⚠️  Warning: No variation_option_id provided for merchandise ${merch.merchandise_id}. This should only happen for merchandise without variations.`)
          
          const stockCheck = await client.query(`
            SELECT current_stock, name 
            FROM event_merchandise 
            WHERE id = $1
          `, [merch.merchandise_id])
          
          if (stockCheck.rows.length === 0) {
            throw new Error(`Merchandise ${merch.merchandise_id} not found`)
          }
          
          const { current_stock, name } = stockCheck.rows[0]
          if (current_stock < merch.quantity) {
            throw new Error(`Insufficient stock for merchandise item "${name}" (ID: ${merch.merchandise_id}). Available: ${current_stock}, Requested: ${merch.quantity}. Note: No variation_option_id provided - this merchandise may need to be updated to use the new variation system.`)
          }
          
          console.log(`✅ Stock validation passed for ${name}: ${current_stock} >= ${merch.quantity} (using deprecated stock field - should be updated)`)
        }
      }
    }
    
    // Add license fees to total
    const licenseFees = orderData.license_fees || 0
    console.log('License fees:', licenseFees, 'Type:', typeof licenseFees)
    
    const finalTotalAmount = Number(totalAmount) + Number(licenseFees)
    console.log('Final total amount (including license fees):', finalTotalAmount, 'Type:', typeof finalTotalAmount)
    
    // STEP 2A: Create order
    console.log('🔍 STEP 2A: Creating order for user ID:', userId)
    console.log('🔍 Order data fields:')
    console.log('  - event_id:', orderData.event_id)
    console.log('  - account_holder_first_name:', orderData.account_holder_first_name)
    console.log('  - account_holder_last_name:', orderData.account_holder_last_name)
    console.log('  - account_holder_email:', orderData.account_holder_email)
    console.log('  - account_holder_mobile:', orderData.account_holder_mobile)
    console.log('  - account_holder_company:', orderData.account_holder_company)
    console.log('  - account_holder_address:', orderData.account_holder_address)
    console.log('  - emergency_contact_name:', orderData.emergency_contact_name)
    console.log('  - emergency_contact_number:', orderData.emergency_contact_number)
    console.log('  - finalTotalAmount:', finalTotalAmount)
    
    const orderResult = await client.query(`
      INSERT INTO orders (
        event_id, account_holder_id, account_holder_first_name, account_holder_last_name,
        account_holder_email, account_holder_mobile, account_holder_company, account_holder_address,
        emergency_contact_name, emergency_contact_number, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
      RETURNING *
    `, [
      orderData.event_id,
      userId,
      orderData.account_holder_first_name,
      orderData.account_holder_last_name,
      orderData.account_holder_email,
      orderData.account_holder_mobile,
      orderData.account_holder_company || null,
      orderData.account_holder_address,
      orderData.emergency_contact_name,
      orderData.emergency_contact_number,
      finalTotalAmount
    ])
    console.log('✅ STEP 2A COMPLETE: Order created with ID:', orderResult.rows[0].id)

    const order = orderResult.rows[0]

    // STEP 2B: Create tickets
    console.log('🔍 STEP 2B: Creating tickets for order:', order.id)
    const tickets = []
    for (const ticketDetail of ticketDetails) {
      // Process ID document if provided
      let idDocumentEncrypted = null
      let idDocumentIv = null
      let idDocumentAuthTag = null
      let idDocumentHash = null
      
      if (ticketDetail.participant.id_document_number) {
        try {
          // Validate SA ID if applicable
          if (ticketDetail.participant.id_document_type === 'sa_id') {
            const validationResult = validateIdNumber(ticketDetail.participant.id_document_number)
            if (!validationResult.valid) {
              throw new Error(`Invalid South African ID number for participant ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name}`)
            }
            
            // Validate date of birth matches ID
            const extractedDob = parseDOB(ticketDetail.participant.id_document_number)
            const providedDob = new Date(ticketDetail.participant.date_of_birth)
            const timeDiff = Math.abs(extractedDob.getTime() - providedDob.getTime())
            const daysDiff = timeDiff / (1000 * 3600 * 24)
            
            if (daysDiff > 1) {
              throw new Error(`Date of birth does not match ID number for participant ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name}`)
            }
          }
          
          // Encrypt the ID number
          const encrypted = encryptIdNumber(ticketDetail.participant.id_document_number)
          idDocumentEncrypted = encrypted.encryptedData
          idDocumentIv = encrypted.iv
          idDocumentAuthTag = encrypted.authTag
          
          // Create hash for searching
          idDocumentHash = hashIdNumber(ticketDetail.participant.id_document_number)
          
          console.log(`✅ ID document processed for participant ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name}`)
        } catch (error) {
          console.error('❌ ID document processing error:', error)
          throw error
        }
      }
      const ticketResult = await client.query(`
        INSERT INTO tickets (
          order_id, event_id, distance_id, participant_first_name, participant_last_name,
          participant_email, participant_mobile, participant_date_of_birth, participant_disabled,
          participant_medical_aid_name, participant_medical_aid_number, emergency_contact_name,
          emergency_contact_number, amount, status, requires_temp_license, permanent_license_number,
          id_document_type, id_document_encrypted, id_document_iv, id_document_auth_tag, 
          id_document_hash, participant_gender, participant_citizenship_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active', $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *
      `, [
        order.id,
        orderData.event_id,
        ticketDetail.distance_id,
        ticketDetail.participant.first_name,
        ticketDetail.participant.last_name,
        ticketDetail.participant.email,
        ticketDetail.participant.mobile,
        ticketDetail.participant.date_of_birth,
        ticketDetail.participant.disabled || false,
        ticketDetail.participant.medical_aid_name || null,
        ticketDetail.participant.medical_aid_number || null,
        ticketDetail.participant.emergency_contact_name,
        ticketDetail.participant.emergency_contact_number,
        ticketDetail.amount,
        ticketDetail.participant.requires_temp_license || false,
        ticketDetail.participant.permanent_license_number || null,
        ticketDetail.participant.id_document_type || null,
        idDocumentEncrypted,
        idDocumentIv,
        idDocumentAuthTag,
        idDocumentHash,
        ticketDetail.participant.gender || null,
        ticketDetail.participant.citizenship_status || null
      ])

      const ticket = ticketResult.rows[0]

      // Add merchandise if selected and update stock
      for (const merch of ticketDetail.merchandise) {
        // Create merchandise order with new variation structure
        await client.query(`
          INSERT INTO ticket_merchandise (
            ticket_id, merchandise_id, variation_id, variation_option_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          ticket.id,
          merch.merchandise_id,
          merch.variation_id || null, // Keep for backward compatibility
          merch.variation_option_id || null, // New field for proper tracking
          merch.quantity,
          merch.unit_price,
          merch.unit_price * merch.quantity
        ])

        // Update stock - now at the variation option level if specified
        if (merch.variation_option_id) {
          // New approach: reduce stock for specific variation option
          await client.query(`
            UPDATE merchandise_variation_options
            SET current_stock = current_stock - $1
            WHERE id = $2 AND current_stock >= $1
          `, [
            merch.quantity,
            merch.variation_option_id
          ])
        } else {
          // Fallback: old approach for merchandise without variations
          await client.query(`
            UPDATE event_merchandise
            SET current_stock = current_stock - $1
            WHERE id = $2
          `, [
            merch.quantity,
            merch.merchandise_id
          ])
        }
      }

      tickets.push(ticket)
    }

    // STEP 2C: Save participants to saved_participants table for future use
    console.log('🔍 STEP 2C: Saving participants for future use')
    console.log(`🔍 Saving participants for user ID: ${userId}`)
    console.log(`🔍 Number of ticket details: ${ticketDetails.length}`)
    
    // Get user profile ID for saved participants
    const userProfileResult = await client.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )
    
    if (userProfileResult.rows.length === 0) {
      console.error('❌ No user profile found for user ID:', userId)
      throw new Error('User profile not found')
    }
    
    const userProfileId = userProfileResult.rows[0].id
    console.log('✅ Found user profile ID:', userProfileId)
    
    for (const ticketDetail of ticketDetails) {
      try {
        console.log(`🔍 Processing participant: ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name}`)
        
        // Check if participant already exists for this user
        const existingParticipant = await client.query(`
          SELECT id FROM saved_participants 
          WHERE user_profile_id = $1 
          AND participant_first_name = $2 
          AND participant_last_name = $3 
          AND participant_email = $4
        `, [
          userProfileId,
          ticketDetail.participant.first_name,
          ticketDetail.participant.last_name,
          ticketDetail.participant.email
        ])

        console.log(`🔍 Existing participant check: ${existingParticipant.rows.length} found`)

        // Only insert if participant doesn't already exist
        if (existingParticipant.rows.length === 0) {
          console.log(`🔍 Inserting new participant with data:`)
          console.log(`  - user_profile_id: ${userProfileId}`)
          console.log(`  - first_name: ${ticketDetail.participant.first_name}`)
          console.log(`  - last_name: ${ticketDetail.participant.last_name}`)
          console.log(`  - email: ${ticketDetail.participant.email}`)
          console.log(`  - mobile: ${ticketDetail.participant.mobile}`)
          console.log(`  - date_of_birth: ${ticketDetail.participant.date_of_birth}`)
          console.log(`  - medical_aid_name: ${ticketDetail.participant.medical_aid_name}`)
          console.log(`  - medical_aid_number: ${ticketDetail.participant.medical_aid_number}`)
          console.log(`  - emergency_contact_name: ${ticketDetail.participant.emergency_contact_name}`)
          console.log(`  - emergency_contact_number: ${ticketDetail.participant.emergency_contact_number}`)
          
          // Process ID document for saved participant
          let savedParticipantIdEncrypted = null
          let savedParticipantIdIv = null
          let savedParticipantIdAuthTag = null
          let savedParticipantIdHash = null
          
          if (ticketDetail.participant.id_document_number) {
            try {
              // Encrypt the ID number for saved participant
              const encrypted = encryptIdNumber(ticketDetail.participant.id_document_number)
              savedParticipantIdEncrypted = encrypted.encryptedData
              savedParticipantIdIv = encrypted.iv
              savedParticipantIdAuthTag = encrypted.authTag
              
              // Create hash for searching
              savedParticipantIdHash = hashIdNumber(ticketDetail.participant.id_document_number)
            } catch (error) {
              console.error('❌ Error encrypting ID for saved participant:', error)
              // Continue without ID data rather than failing
            }
          }

          const insertResult = await client.query(`
            INSERT INTO saved_participants (
              user_profile_id, participant_first_name, participant_last_name, participant_email, participant_mobile, participant_date_of_birth,
              participant_medical_aid, participant_medical_aid_number, emergency_contact_name, emergency_contact_number,
              id_document_type, id_document_encrypted, id_document_iv, id_document_auth_tag, id_document_hash, gender, citizenship_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING id
          `, [
            userProfileId,
            ticketDetail.participant.first_name,
            ticketDetail.participant.last_name,
            ticketDetail.participant.email,
            ticketDetail.participant.mobile,
            ticketDetail.participant.date_of_birth,
            ticketDetail.participant.medical_aid_name || null,
            ticketDetail.participant.medical_aid_number || null,
            ticketDetail.participant.emergency_contact_name,
            ticketDetail.participant.emergency_contact_number,
            ticketDetail.participant.id_document_type || null,
            savedParticipantIdEncrypted,
            savedParticipantIdIv,
            savedParticipantIdAuthTag,
            savedParticipantIdHash,
            ticketDetail.participant.gender || null,
            ticketDetail.participant.citizenship_status || null
          ])
          console.log(`✅ Saved participant: ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name} with ID: ${insertResult.rows[0].id}`)
        } else {
          console.log(`ℹ️ Participant already saved: ${ticketDetail.participant.first_name} ${ticketDetail.participant.last_name}`)
        }
      } catch (error) {
        console.error('❌ Error saving participant:', error)
        // Don't fail the entire registration if saving participant fails
      }
    }

    await client.query('COMMIT')
    console.log('✅ STEP 2 COMPLETE: Event registration transaction committed successfully')
    console.log('✅ Order ID after commit:', order.id)
    console.log('✅ Number of tickets created:', tickets.length)

    // Get event details for the response
    const eventResult = await client.query(`
      SELECT name, start_date, start_time, city, category
      FROM events 
      WHERE id = $1
    `, [orderData.event_id])
    
    if (eventResult.rows.length === 0) {
      console.error('❌ Event not found for ID:', orderData.event_id)
      throw new Error('Event not found')
    }
    
    const event = eventResult.rows[0]
    console.log('✅ Event found for response:', event.name)

    // Prepare response data
    console.log('🔍 Preparing response data...')
    console.log('🔍 Order data:', order)
    console.log('🔍 Event data:', event)
    console.log('🔍 Tickets data:', tickets.length, 'tickets')
    
    // Get merchandise for this order
    const merchandiseResult = await pool.query(`
      SELECT 
        tm.merchandise_id,
        tm.quantity,
        tm.unit_price,
        tm.total_price,
        em.name as merchandise_name,
        em.description,
        em.image_url
      FROM ticket_merchandise tm
      JOIN event_merchandise em ON tm.merchandise_id = em.id
      JOIN tickets t ON tm.ticket_id = t.id
      WHERE t.order_id = $1
    `, [order.id])

    const responseData: any = {
      order: {
        ...order,
        event_name: event.name,
        start_date: event.start_date,
        start_time: event.start_time,
        city: event.city,
        category: event.category,
        merchandise: merchandiseResult.rows
      },
      tickets: tickets.map(ticket => ({
        ...ticket,
        participant_name: `${ticket.participant_first_name} ${ticket.participant_last_name}`
      }))
    }
    console.log('✅ Response data prepared successfully')

    // STEP 3: Generate JWT token for new users
    if (!req.localUser?.userId && userId) {
      console.log('🔍 STEP 3: Creating authentication data for new user:')
      console.log('  - userId:', userId)
      console.log('  - email:', orderData.account_holder_email)
      
      // Generate a proper JWT token for the new user
      const jwt = require('jsonwebtoken')
      const token = jwt.sign(
        { 
          userId: userId,
          email: orderData.account_holder_email,
          role: 'participant'
        },
        process.env.JWT_SECRET || 'fallback-secret-for-development',
        { expiresIn: '7d' }
      )
      
      console.log('🔐 JWT Token generated:')
      console.log('  - Token length:', token.length)
      console.log('  - Token preview:', token.substring(0, 50) + '...')
      console.log('  - User ID in token:', userId)
      
      responseData.auth = {
        token,
        user: {
          id: userId,
          email: orderData.account_holder_email,
          first_name: orderData.account_holder_first_name,
          last_name: orderData.account_holder_last_name,
          role: 'participant'
        }
      }
      
      console.log('✅ STEP 3 COMPLETE: Authentication data created:', responseData.auth)
    } else {
      console.log('🔐 No authentication data needed:')
      console.log('  - req.localUser?.userId:', req.localUser?.userId)
      console.log('  - userId:', userId)
    }

    // STEP 4: Send confirmation emails to participants
    console.log('📧 STEP 4: Sending confirmation emails...')
    try {
      // Get organizer details for email
      const organizerResult = await client.query(`
        SELECT u.first_name, u.last_name, u.organizer_logo_url
        FROM events e
        JOIN users u ON e.organiser_id = u.id
        WHERE e.id = $1
      `, [orderData.event_id])
      
      const organizer = organizerResult.rows[0]
      const organizerName = `${organizer.first_name} ${organizer.last_name}`
      const organizerLogo = organizer.organizer_logo_url ? 
        `${process.env.BACKEND_URL || 'http://localhost:5001'}${organizer.organizer_logo_url}` : 
        undefined

      // Send email for each ticket
      for (const ticket of tickets) {
        // Get distance name for this ticket
        const distanceResult = await client.query(`
          SELECT name FROM event_distances WHERE id = $1
        `, [ticket.distance_id])
        
        const distanceName = distanceResult.rows[0]?.name || 'Unknown Distance'
        
        const emailData: any = {
          participantName: `${ticket.participant_first_name} ${ticket.participant_last_name}`,
          participantEmail: ticket.participant_email,
          eventName: event.name,
          eventDate: event.start_date,
          eventTime: event.start_time,
          eventLocation: event.city,
          distanceName: distanceName,
          ticketNumber: ticket.ticket_number,
          organizerName: organizerName,
          organizerLogo: organizerLogo,
          eventSlug: event.slug,
          orderId: order.id,
          ticketPDF: undefined
        }

        // Note: PDF tickets are now downloaded from the participant dashboard
        // No need to generate PDF for email attachment

        const emailSent = await emailService.sendEventRegistrationEmail(emailData)
        if (emailSent) {
          console.log(`✅ Confirmation email sent to ${ticket.participant_email}`)
        } else {
          console.error(`❌ Failed to send confirmation email to ${ticket.participant_email}`)
        }
      }
      
      console.log('✅ STEP 4 COMPLETE: Email sending process completed')
    } catch (emailError) {
      console.error('❌ Email sending error (non-blocking):', emailError)
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      data: responseData,
      message: 'Registration successful'
    } as ApiResponse)

  } catch (error: any) {
    console.error('❌ Registration error:', error)
    
    // Only rollback if we're in a transaction
    try {
      await client.query('ROLLBACK')
      console.log('🔄 Transaction rolled back')
    } catch (rollbackError) {
      console.log('ℹ️ No transaction to rollback or rollback failed:', rollbackError)
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process registration'
    } as ApiResponse)
  } finally {
    client.release()
  }
})

/**
 * Get user's orders and tickets
 */
router.get('/my-orders', authenticateToken, async (req: Request, res: Response) => {
  try {
    console.log('🔍 getMyOrders - req.localUser:', req.localUser)
    const userId = req.localUser!.userId
    console.log('🔍 getMyOrders - userId:', userId)
    
    // First, let's check if the user exists in the database
    const userCheck = await pool.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [userId])
    console.log('🔍 User check result:', userCheck.rows.length, 'rows found')
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found in database with ID:', userId)
      return res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse)
    }
    console.log('✅ User found:', userCheck.rows[0])

    const result = await pool.query(`
      SELECT 
        o.id, o.event_id, o.total_amount, o.status, o.created_at,
        e.name as event_name, e.start_date, e.start_time, e.city,
        json_agg(
          json_build_object(
            'id', t.id,
            'ticket_number', t.ticket_number,
            'participant_name', t.participant_first_name || ' ' || t.participant_last_name,
            'participant_email', t.participant_email,
            'amount', t.amount,
            'status', t.status
          )
        ) FILTER (WHERE t.id IS NOT NULL) as tickets
      FROM orders o
      JOIN events e ON o.event_id = e.id
      LEFT JOIN tickets t ON o.id = t.order_id
      WHERE o.account_holder_id = $1
      GROUP BY o.id, o.event_id, o.total_amount, o.status, o.created_at, e.name, e.start_date, e.start_time, e.city
      ORDER BY o.created_at DESC
    `, [userId])

    // Get merchandise for each order
    const ordersWithMerchandise = await Promise.all(
      result.rows.map(async (order) => {
        const merchandiseResult = await pool.query(`
          SELECT 
            tm.merchandise_id,
            tm.quantity,
            tm.unit_price,
            tm.total_price,
            em.name as merchandise_name,
            em.description,
            em.image_url
          FROM ticket_merchandise tm
          JOIN event_merchandise em ON tm.merchandise_id = em.id
          JOIN tickets t ON tm.ticket_id = t.id
          WHERE t.order_id = $1
        `, [order.id])

        return {
          ...order,
          merchandise: merchandiseResult.rows
        }
      })
    )

    res.json({
      success: true,
      data: ordersWithMerchandise
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get my orders error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get orders'
    } as ApiResponse)
  }
})

/**
 * Get specific ticket details
 */
router.get('/ticket/:ticketId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params
    const userId = req.localUser!.userId

    const result = await pool.query(`
      SELECT 
        t.*, e.name as event_name, e.start_date, e.start_time, e.venue_name, e.address, e.city,
        ed.name as distance_name, ed.price as distance_price,
        o.account_holder_first_name, o.account_holder_last_name, o.account_holder_email
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      JOIN event_distances ed ON t.distance_id = ed.id
      JOIN orders o ON t.order_id = o.id
      WHERE t.id = $1 AND o.account_holder_id = $2
    `, [ticketId, userId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse)
    }

    // Get merchandise for this ticket
    const merchandiseResult = await pool.query(`
      SELECT 
        tm.*, em.name as merchandise_name, em.description, em.image_url,
        mv.variation_name, mv.variation_options
      FROM ticket_merchandise tm
      JOIN event_merchandise em ON tm.merchandise_id = em.id
      LEFT JOIN merchandise_variations mv ON tm.variation_id = mv.id
      WHERE tm.ticket_id = $1
    `, [ticketId])

    const ticket = result.rows[0]
    ticket.merchandise = merchandiseResult.rows

    res.json({
      success: true,
      data: ticket
    } as ApiResponse)

  } catch (error: any) {
    console.error('Get ticket error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ticket'
    } as ApiResponse)
  }
})

/**
 * Get saved participants for the authenticated user
 */
router.get('/saved-participants', (req: Request, res: Response, next: NextFunction) => {
  console.log('🎯 GET /saved-participants endpoint hit - before auth')
  console.log('🔍 Request headers:', req.headers)
  next()
}, authenticateToken, async (req: Request, res: Response) => {
  console.log('🎯 GET /saved-participants endpoint hit - after auth')
  try {
    const userId = req.localUser!.userId
    console.log('🔍 Getting saved participants for user:', userId)

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )
    console.log('🔍 User profile result:', userProfileResult.rows)

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Get saved participants
    console.log('🔍 Looking for saved participants with user_profile_id:', userProfileId)
    const result = await pool.query(`
      SELECT 
        sp.id, 
        sp.participant_first_name as first_name, 
        sp.participant_last_name as last_name, 
        sp.participant_email as email, 
        sp.participant_mobile as mobile, 
        sp.participant_date_of_birth::text as date_of_birth,
        sp.participant_medical_aid as medical_aid_name, 
        sp.participant_medical_aid_number as medical_aid_number, 
        sp.emergency_contact_name, 
        sp.emergency_contact_number,
        sp.id_document_type,
        sp.id_document_encrypted,
        sp.id_document_iv,
        sp.id_document_auth_tag,
        sp.gender,
        sp.citizenship_status,
        sp.created_at, 
        sp.updated_at
      FROM saved_participants sp
      JOIN user_profiles up ON sp.user_profile_id = up.id
      WHERE up.user_id = $1
      ORDER BY sp.created_at DESC
    `, [userId])
    console.log('🔍 Found saved participants:', result.rows)

    // Process the results to include masked ID numbers
    const processedResults = result.rows.map(participant => {
      let id_document_masked = null
      
      console.log(`🔍 Processing participant ${participant.first_name}, DOB: ${participant.date_of_birth}`)
      
      if (participant.id_document_encrypted && participant.id_document_iv && participant.id_document_auth_tag) {
        try {
          // Decrypt the ID to mask it
          const decryptedId = decryptIdNumber({
            encryptedData: participant.id_document_encrypted,
            iv: participant.id_document_iv,
            authTag: participant.id_document_auth_tag
          })
          id_document_masked = maskIdNumber(decryptedId)
          console.log(`✅ Successfully masked ID for ${participant.first_name}:`, id_document_masked)
        } catch (error) {
          console.error(`❌ Error decrypting ID for ${participant.first_name}:`, error)
          // Temporary fallback for testing
          if (participant.id_document_type === 'sa_id') {
            id_document_masked = '891231*****83' // Test masked ID
            console.log(`🔧 Using test masked ID for ${participant.first_name}`)
          }
        }
      } else {
        console.log(`⚠️ Missing encryption data for ${participant.first_name}`)
        // Temporary fallback for testing
        if (participant.id_document_type === 'sa_id') {
          id_document_masked = '891231*****83' // Test masked ID
          console.log(`🔧 Using test masked ID for ${participant.first_name}`)
        }
      }

      return {
        ...participant,
        id_document_masked,
        // Remove encrypted fields from response for security
        id_document_encrypted: undefined,
        id_document_iv: undefined,
        id_document_auth_tag: undefined
      }
    })

    res.json({
      success: true,
      data: processedResults
    } as ApiResponse)
  } catch (error) {
    console.error('Get saved participants error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get saved participants'
    } as ApiResponse)
  }
})

/**
 * Get a single saved participant for editing (with unmasked ID)
 */
router.get('/saved-participants/:participantId/edit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params
    const userId = req.localUser!.userId

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Get the specific participant
    const result = await pool.query(`
      SELECT 
        sp.id, 
        sp.participant_first_name as first_name, 
        sp.participant_last_name as last_name, 
        sp.participant_email as email, 
        sp.participant_mobile as mobile, 
        sp.participant_date_of_birth::text as date_of_birth,
        sp.participant_medical_aid as medical_aid_name, 
        sp.participant_medical_aid_number as medical_aid_number, 
        sp.emergency_contact_name, 
        sp.emergency_contact_number,
        sp.id_document_type,
        sp.id_document_encrypted,
        sp.id_document_iv,
        sp.id_document_auth_tag,
        sp.gender,
        sp.citizenship_status,
        sp.created_at, 
        sp.updated_at
      FROM saved_participants sp
      WHERE sp.id = $1 AND sp.user_profile_id = $2
    `, [participantId, userProfileId])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    const participant = result.rows[0]
    let id_document_number = null

    // Decrypt the ID number for editing
    if (participant.id_document_encrypted && participant.id_document_iv && participant.id_document_auth_tag) {
      try {
        id_document_number = decryptIdNumber({
          encryptedData: participant.id_document_encrypted,
          iv: participant.id_document_iv,
          authTag: participant.id_document_auth_tag
        })
      } catch (error) {
        console.error(`❌ Error decrypting ID for editing:`, error)
      }
    }

    // Return participant data with unmasked ID for editing
    const participantData = {
      ...participant,
      id_document_number,
      // Remove encrypted fields from response
      id_document_encrypted: undefined,
      id_document_iv: undefined,
      id_document_auth_tag: undefined
    }

    res.json({
      success: true,
      data: participantData
    } as ApiResponse)
  } catch (error) {
    console.error('Get participant for edit error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get participant for editing'
    } as ApiResponse)
  }
})

/**
 * Update a saved participant
 */
router.put('/saved-participants/:participantId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params
    const userId = req.localUser!.userId
    const updateData = req.body

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Verify the participant belongs to this user
    const participantCheck = await pool.query(
      'SELECT id FROM saved_participants WHERE id = $1 AND user_profile_id = $2',
      [participantId, userProfileId]
    )

    if (participantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    // Process ID document if provided
    let idDocumentEncrypted = null
    let idDocumentIv = null
    let idDocumentAuthTag = null
    let idDocumentHash = null
    
    if (updateData.id_document_number) {
      try {
        // Validate SA ID if applicable
        if (updateData.id_document_type === 'sa_id') {
          const validationResult = validateIdNumber(updateData.id_document_number)
          if (!validationResult.valid) {
            return res.status(400).json({
              success: false,
              error: 'Invalid South African ID number'
            } as ApiResponse)
          }
        }
        
        // Encrypt the ID number
        const encrypted = encryptIdNumber(updateData.id_document_number)
        idDocumentEncrypted = encrypted.encryptedData
        idDocumentIv = encrypted.iv
        idDocumentAuthTag = encrypted.authTag
        
        // Create hash for searching
        idDocumentHash = hashIdNumber(updateData.id_document_number)
        
        console.log(`✅ ID document processed for participant update`)
      } catch (error) {
        console.error('❌ ID document processing error:', error)
        return res.status(400).json({
          success: false,
          error: 'Failed to process ID document'
        } as ApiResponse)
      }
    }

    // Update the participant
    const result = await pool.query(`
      UPDATE saved_participants SET
        participant_first_name = $1,
        participant_last_name = $2,
        participant_email = $3,
        participant_mobile = $4,
        participant_date_of_birth = $5,
        participant_medical_aid = $6,
        participant_medical_aid_number = $7,
        emergency_contact_name = $8,
        emergency_contact_number = $9,
        id_document_type = COALESCE($10, id_document_type),
        id_document_encrypted = COALESCE($11, id_document_encrypted),
        id_document_iv = COALESCE($12, id_document_iv),
        id_document_auth_tag = COALESCE($13, id_document_auth_tag),
        id_document_hash = COALESCE($14, id_document_hash),
        gender = COALESCE($15, gender),
        citizenship_status = COALESCE($16, citizenship_status),
        updated_at = NOW()
      WHERE id = $17 AND user_profile_id = $18
      RETURNING *
    `, [
      updateData.first_name || updateData.participant_first_name,
      updateData.last_name || updateData.participant_last_name,
      updateData.email || updateData.participant_email,
      updateData.mobile || updateData.participant_mobile,
      updateData.date_of_birth || updateData.participant_date_of_birth,
      updateData.medical_aid_name || updateData.participant_medical_aid || null,
      updateData.medical_aid_number || updateData.participant_medical_aid_number || null,
      updateData.emergency_contact_name,
      updateData.emergency_contact_number,
      updateData.id_document_type || null,
      idDocumentEncrypted,
      idDocumentIv,
      idDocumentAuthTag,
      idDocumentHash,
      updateData.gender || null,
      updateData.citizenship_status || null,
      participantId,
      userProfileId
    ])

    res.json({
      success: true,
      data: result.rows[0]
    } as ApiResponse)
  } catch (error) {
    console.error('Update saved participant error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update participant'
    } as ApiResponse)
  }
})

/**
 * Delete a saved participant
 */
router.delete('/saved-participants/:participantId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params
    const userId = req.localUser!.userId

    // Get user profile ID
    const userProfileResult = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    )

    if (userProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      } as ApiResponse)
    }

    const userProfileId = userProfileResult.rows[0].id

    // Delete the participant
    const result = await pool.query(
      'DELETE FROM saved_participants WHERE id = $1 AND user_profile_id = $2',
      [participantId, userProfileId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found or access denied'
      } as ApiResponse)
    }

    res.json({
      success: true,
      message: 'Participant deleted successfully'
    } as ApiResponse)
  } catch (error) {
    console.error('Delete saved participant error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete participant'
    } as ApiResponse)
  }
})

export default router
