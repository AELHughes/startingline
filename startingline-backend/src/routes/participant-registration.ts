import express, { Request, Response, NextFunction } from 'express'
import { pool } from '../lib/database'
import { authenticateToken, optionalAuth } from '../middleware/auth-local'
import { ApiResponse } from '../types'

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
  merchandise?: Array<{
    merchandise_id: string
    variation_id?: string
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
  participants: Array<{
    distance_id: string
    participant: ParticipantData
  }>
}

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
        e.license_required, e.temp_license_fee, e.license_details,
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
        id, name, price, min_age, entry_limit, start_time,
        free_for_seniors, free_for_disability, senior_age_threshold
      FROM event_distances
      WHERE event_id = $1
      ORDER BY price ASC
    `, [eventId])

    // Get merchandise
    const merchandiseResult = await pool.query(`
      SELECT 
        em.id, em.name, em.description, em.price, em.image_url,
        json_agg(
          json_build_object(
            'id', mv.id,
            'name', mv.variation_name,
            'options', mv.variation_options
          )
        ) as variations
      FROM event_merchandise em
      LEFT JOIN merchandise_variations mv ON em.id = mv.merchandise_id
      WHERE em.event_id = $1
      GROUP BY em.id, em.name, em.description, em.price, em.image_url
    `, [eventId])

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          distances: distancesResult.rows,
          merchandise: merchandiseResult.rows.map(item => ({
            ...item,
            variations: item.variations.filter((v: any) => v.id !== null)
          }))
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

    const result = await pool.query(`
      INSERT INTO saved_participants (
        user_profile_id, participant_first_name, participant_last_name, participant_email, participant_mobile, participant_date_of_birth,
        participant_medical_aid, participant_medical_aid_number, emergency_contact_name, emergency_contact_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      userProfileId,
      participantData.first_name,
      participantData.last_name,
      participantData.email,
      participantData.mobile,
      participantData.date_of_birth,
      participantData.medical_aid_name || null,
      participantData.medical_aid_number || null,
      participantData.emergency_contact_name,
      participantData.emergency_contact_number
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

      // Check if participant qualifies for free entry
      let isFree = false
      if (item.participant.disabled && distance.free_for_disabled) {
        isFree = true
      } else if (distance.free_for_seniors && age >= distance.senior_age_threshold) {
        isFree = true
      }

      const ticketAmount = isFree ? 0 : Number(distance.price)
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
    const finalTotalAmount = Number(totalAmount)
    console.log('Final total amount:', finalTotalAmount, 'Type:', typeof finalTotalAmount)
    
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
      const ticketResult = await client.query(`
        INSERT INTO tickets (
          order_id, event_id, distance_id, participant_first_name, participant_last_name,
          participant_email, participant_mobile, participant_date_of_birth, participant_disabled,
          participant_medical_aid_name, participant_medical_aid_number, emergency_contact_name,
          emergency_contact_number, amount, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'active')
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
        ticketDetail.amount
      ])

      const ticket = ticketResult.rows[0]

      // Add merchandise if selected
      for (const merch of ticketDetail.merchandise) {
        await client.query(`
          INSERT INTO ticket_merchandise (
            ticket_id, merchandise_id, variation_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          ticket.id,
          merch.merchandise_id,
          merch.variation_id || null,
          merch.quantity,
          merch.unit_price,
          merch.unit_price * merch.quantity
        ])
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
          
          const insertResult = await client.query(`
            INSERT INTO saved_participants (
              user_profile_id, participant_first_name, participant_last_name, participant_email, participant_mobile, participant_date_of_birth,
              participant_medical_aid, participant_medical_aid_number, emergency_contact_name, emergency_contact_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            ticketDetail.participant.emergency_contact_number
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
    
    const responseData: any = {
      order: {
        ...order,
        event_name: event.name,
        start_date: event.start_date,
        start_time: event.start_time,
        city: event.city,
        category: event.category
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
        ) as tickets
      FROM orders o
      JOIN events e ON o.event_id = e.id
      LEFT JOIN tickets t ON o.id = t.order_id
      WHERE o.account_holder_id = $1
      GROUP BY o.id, o.event_id, o.total_amount, o.status, o.created_at, e.name, e.start_date, e.start_time, e.city
      ORDER BY o.created_at DESC
    `, [userId])

    res.json({
      success: true,
      data: result.rows
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
        sp.participant_date_of_birth as date_of_birth,
        sp.participant_medical_aid as medical_aid_name, 
        sp.participant_medical_aid_number as medical_aid_number, 
        sp.emergency_contact_name, 
        sp.emergency_contact_number,
        sp.created_at, 
        sp.updated_at
      FROM saved_participants sp
      JOIN user_profiles up ON sp.user_profile_id = up.id
      WHERE up.user_id = $1
      ORDER BY sp.created_at DESC
    `, [userId])
    console.log('🔍 Found saved participants:', result.rows)

    res.json({
      success: true,
      data: result.rows
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
        updated_at = NOW()
      WHERE id = $10 AND user_profile_id = $11
      RETURNING *
    `, [
      updateData.participant_first_name,
      updateData.participant_last_name,
      updateData.participant_email,
      updateData.participant_mobile,
      updateData.participant_date_of_birth,
      updateData.participant_medical_aid || null,
      updateData.participant_medical_aid_number || null,
      updateData.emergency_contact_name,
      updateData.emergency_contact_number,
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
