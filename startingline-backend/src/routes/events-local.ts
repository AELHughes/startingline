import express, { Request, Response } from 'express'
import { pool, createAuditTrailEntry, getEventAuditTrail, createNotification } from '../lib/database'
import { authenticateToken, requireOrganiser, requireOrganiserOrAdmin, optionalAuth } from '../middleware/auth-local'
import type { ApiResponse, Event, CreateEventData } from '../types'

const router = express.Router()

// ============================================
// PUBLIC EVENT ROUTES
// ============================================

/**
 * Get all published events (public endpoint)
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching all published events...')
    
    const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        COUNT(ed.id) as distance_count
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      LEFT JOIN event_distances ed ON e.id = ed.event_id
      WHERE e.status = 'published'
      GROUP BY e.id, u.first_name, u.last_name
      ORDER BY e.start_date ASC
    `
    
    const result = await pool.query(query)
    
    // Get distances and merchandise for each event
    const eventsWithDetails = await Promise.all(
      result.rows.map(async (event) => {
        // Get distances with capacity information
        const distancesResult = await pool.query(`
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
          WHERE ed.event_id = $1 
          ORDER BY ed.distance_km ASC
        `, [event.id])
        
        // Get merchandise
        const merchandiseResult = await pool.query(
          'SELECT * FROM event_merchandise WHERE event_id = $1',
          [event.id]
        )
        
        return {
          ...event,
          distances: distancesResult.rows,
          merchandise: merchandiseResult.rows
        }
      })
    )
    
    console.log(`✅ Found ${eventsWithDetails.length} published events`)
    
    res.json({
      success: true,
      data: eventsWithDetails
    } as ApiResponse<Event[]>)
    
  } catch (error: any) {
    console.error('❌ Get events error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    } as ApiResponse)
  }
})

/**
 * Get event by slug (public endpoint)
 */
router.get('/slug/:slug', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    console.log('🔍 Fetching event by slug:', slug)
    
    const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        u.email AS organiser_email
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      WHERE e.slug = $1
    `
    
    const result = await pool.query(query, [slug])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const event = result.rows[0]
    
    // Get distances with capacity information
    const distancesResult = await pool.query(`
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
      WHERE ed.event_id = $1 
      ORDER BY ed.distance_km ASC
    `, [event.id])
    
    // Get merchandise with variations
    const merchandiseQuery = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', mv.id,
              'variation_name', mv.variation_name,
              'variation_options', mv.variation_options
            )
          ) FILTER (WHERE mv.id IS NOT NULL),
          '[]'::json
        ) as variations
      FROM event_merchandise m
      LEFT JOIN merchandise_variations mv ON m.id = mv.merchandise_id
      WHERE m.event_id = $1
      GROUP BY m.id
    `
    
    const merchandiseResult = await pool.query(merchandiseQuery, [event.id])
    
    const eventWithDetails = {
      ...event,
      distances: distancesResult.rows,
      merchandise: merchandiseResult.rows
    }
    
    console.log(`✅ Found event: ${event.name}`)
    
    res.json({
      success: true,
      data: eventWithDetails
    } as ApiResponse<Event>)
    
  } catch (error: any) {
    console.error('❌ Get event by slug error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    } as ApiResponse)
  }
})

/**
 * Get my events (organizer only) - MUST be before /:id route
 */
router.get('/my', authenticateToken, requireOrganiser, async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching events for organizer:', req.localUser?.userId)
    
    const query = `
      SELECT 
        e.*,
        COUNT(ed.id) as distance_count,
        COUNT(em.id) as merchandise_count
      FROM events e
      LEFT JOIN event_distances ed ON e.id = ed.event_id
      LEFT JOIN event_merchandise em ON e.id = em.event_id
      WHERE e.organiser_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `
    
    const result = await pool.query(query, [req.localUser!.userId])
    
    console.log(`✅ Found ${result.rows.length} events for organizer`)
    
    // Get distances and merchandise for each event
    const eventsWithDetails = await Promise.all(
      result.rows.map(async (event) => {
        // Get distances with capacity information
        const distancesResult = await pool.query(`
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
          WHERE ed.event_id = $1 
          ORDER BY ed.distance_km ASC
        `, [event.id])
        
        // Get merchandise
        const merchandiseResult = await pool.query(`
          SELECT 
            em.*,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', mv.id,
                  'variation_name', mv.variation_name,
                  'variation_options', mv.variation_options
                )
              ) FILTER (WHERE mv.id IS NOT NULL),
              '[]'::json
            ) as variations
          FROM event_merchandise em
          LEFT JOIN merchandise_variations mv ON em.id = mv.merchandise_id
          WHERE em.event_id = $1
          GROUP BY em.id
        `, [event.id])
        
        return {
          ...event,
          distances: distancesResult.rows,
          merchandise: merchandiseResult.rows
        }
      })
    )
    
    res.json({
      success: true,
      data: eventsWithDetails
    } as ApiResponse<Event[]>)
    
  } catch (error: any) {
    console.error('❌ Get my events error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your events'
    } as ApiResponse)
  }
})

/**
 * Get event by ID (public endpoint)
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    console.log('🔍 Fetching event by ID:', id)
    
    const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        u.email AS organiser_email
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      WHERE e.id = $1
    `
    
    const result = await pool.query(query, [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const event = result.rows[0]
    
    // Get distances and merchandise (same as slug route)
    const [distancesResult, merchandiseResult] = await Promise.all([
      pool.query(`
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
        WHERE ed.event_id = $1 
        ORDER BY ed.distance_km ASC
      `, [event.id]),
      pool.query(`
        SELECT 
          m.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', mv.id,
                'variation_name', mv.variation_name,
                'variation_options', mv.variation_options
              )
            ) FILTER (WHERE mv.id IS NOT NULL),
            '[]'::json
          ) as variations
        FROM event_merchandise m
        LEFT JOIN merchandise_variations mv ON m.id = mv.merchandise_id
        WHERE m.event_id = $1
        GROUP BY m.id
      `, [event.id])
    ])
    
    const eventWithDetails = {
      ...event,
      distances: distancesResult.rows,
      merchandise: merchandiseResult.rows
    }
    
    console.log(`✅ Found event: ${event.name}`)
    
    res.json({
      success: true,
      data: eventWithDetails
    } as ApiResponse<Event>)
    
  } catch (error: any) {
    console.error('❌ Get event by ID error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event'
    } as ApiResponse)
  }
})

// ============================================
// AUTHENTICATED EVENT ROUTES
// ============================================


/**
 * Create new event (organizer only)
 */
router.post('/', authenticateToken, requireOrganiser, async (req: Request, res: Response) => {
  console.log('🚀 EVENT CREATION ENDPOINT REACHED - POST /')
  console.log('🔍 req.localUser after middleware:', req.localUser)
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const eventData: CreateEventData = req.body
    const organiserId = req.localUser!.userId
    
    console.log('🔍 Creating event:', eventData.name, 'for organizer:', organiserId)
    console.log('🔍 req.localUser:', req.localUser)
    console.log('🔍 organiserId type:', typeof organiserId)
    console.log('🔍 organiserId value:', organiserId)
    
    // Validate required fields
    if (!eventData.name || !eventData.category || !eventData.start_date) {
      console.log('❌ Validation failed - missing required fields')
      console.log('🔍 eventData.name:', eventData.name)
      console.log('🔍 eventData.category:', eventData.category)
      console.log('🔍 eventData.start_date:', eventData.start_date)
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, and start_date are required'
      } as ApiResponse)
    }
    
    console.log('✅ Validation passed - all required fields present')
    
    // Validate merchandise variations if provided
    if (eventData.merchandise && eventData.merchandise.length > 0) {
      console.log('🔍 Validating merchandise variations...')
      for (const merch of eventData.merchandise) {
        if (merch.variations && merch.variations.length > 0) {
          for (const variation of merch.variations) {
            if (!variation.variation_name || !variation.variation_options) {
              console.log('❌ Invalid merchandise variation:', variation)
              return res.status(400).json({
                success: false,
                error: `Invalid merchandise variation for ${merch.name}: variation_name and variation_options are required`
              } as ApiResponse)
            }
          }
        }
      }
      console.log('✅ Merchandise variations validation passed')
    }
    
    // Generate slug
    const baseSlug = eventData.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
    
    console.log('🔍 Generated slug:', baseSlug + '-' + Date.now())
    
    // Create event
    const eventQuery = `
      INSERT INTO events (
        name, slug, category, organiser_id, start_date, start_time,
        venue_name, address, city, province, country, latitude, longitude,
        license_required, temp_license_fee, license_details,
        primary_image_url, gallery_images, description, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `
    
    console.log('🔍 Event query prepared')
    console.log('🔍 About to prepare event values...')
    
    const eventValues = [
      eventData.name,
      baseSlug + '-' + Date.now(), // Simple unique slug
      eventData.category,
      organiserId,
      eventData.start_date,
      eventData.start_time,
      eventData.venue_name,
      eventData.address,
      eventData.city,
      eventData.province,
      eventData.country || 'South Africa',
      eventData.latitude,
      eventData.longitude,
      eventData.license_required,
      eventData.temp_license_fee,
      eventData.license_details,
      eventData.primary_image_url,
      JSON.stringify(eventData.gallery_images || []),
      eventData.description,
      eventData.status || 'draft'
    ]
    
    console.log('🔍 Event values prepared:', eventValues.length, 'values')
    
    console.log('🔍 Executing event creation query:')
    console.log('  - Query:', eventQuery)
    console.log('  - Values:', eventValues)
    console.log('  - organiserId:', organiserId)
    console.log('  - organiserId type:', typeof organiserId)
    
    let newEvent: any
    try {
      console.log('🔍 About to execute event creation query...')
      const eventResult = await client.query(eventQuery, eventValues)
      newEvent = eventResult.rows[0]
      
      console.log('✅ Event created successfully:', newEvent.id)
      console.log('✅ Event details:', newEvent)
      
      // Verify the event was actually created
      if (!newEvent || !newEvent.id) {
        throw new Error('Event creation failed - no event ID returned')
      }
      
    } catch (eventError: any) {
      console.error('❌ Event creation failed:', eventError.message)
      console.error('❌ Event creation error details:', eventError)
      console.error('❌ Event creation error code:', eventError.code)
      console.error('❌ Event creation error detail:', eventError.detail)
      throw eventError
    }
    
    // Create distances if provided
    if (eventData.distances && eventData.distances.length > 0) {
      for (const distance of eventData.distances) {
        await client.query(`
          INSERT INTO event_distances (
            event_id, name, distance_km, price, min_age, entry_limit,
            start_time, free_for_seniors, free_for_disability, senior_age_threshold
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          newEvent.id,
          distance.name,
          distance.distance_km,
          distance.price,
          distance.min_age,
          distance.entry_limit,
          distance.start_time,
          distance.free_for_seniors || false,
          distance.free_for_disability || false,
          distance.senior_age_threshold || 65
        ])
      }
    }
    
    // Create merchandise if provided
    if (eventData.merchandise && eventData.merchandise.length > 0) {
      for (const merch of eventData.merchandise) {
        const merchResult = await client.query(`
          INSERT INTO event_merchandise (event_id, name, description, price, image_url)
          VALUES ($1, $2, $3, $4, $5) RETURNING id
        `, [
          newEvent.id,
          merch.name,
          merch.description,
          merch.price,
          merch.image_url
        ])
        
        // Create variations if provided
        if (merch.variations && merch.variations.length > 0) {
          for (const variation of merch.variations) {
            // Validate variation data
            if (!variation.variation_name || !variation.variation_options) {
              console.warn('⚠️ Skipping invalid variation:', variation)
              continue
            }
            
            await client.query(`
              INSERT INTO merchandise_variations (merchandise_id, variation_name, variation_options)
              VALUES ($1, $2, $3)
            `, [
              merchResult.rows[0].id,
              variation.variation_name,
              JSON.stringify(variation.variation_options)
            ])
          }
        }
      }
    }
    
    // Create audit trail entry for event creation - ONLY if event was successfully created
    if (newEvent && newEvent.id) {
      console.log('🔍 Creating audit trail entry:')
      console.log('  - event_id:', newEvent.id)
      console.log('  - organiserId:', organiserId)
      console.log('  - organiserId type:', typeof organiserId)
      
      try {
        // Create audit trail entry within the same transaction
        const auditQuery = `
          INSERT INTO event_audit_trail (event_id, action_type, performed_by, performed_by_role, message, metadata)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `
        const auditValues = [
          newEvent.id,
          'created',
          organiserId,
          'organiser',
          'Event created as draft',
          null
        ]
        
        console.log('🔍 Executing audit trail query within transaction...')
        const auditResult = await client.query(auditQuery, auditValues)
        console.log('✅ Audit trail entry created successfully:', auditResult.rows[0])
        
        // If status is pending_approval, update the event status and create another audit trail entry
        if (eventData.status === 'pending_approval') {
          console.log('🔍 Event submitted for approval - updating status and creating audit trail...')
          
          // Update event status to pending_approval
          await client.query(
            'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2',
            ['pending_approval', newEvent.id]
          )
          
          // Create audit trail entry for status change
          const statusChangeAuditValues = [
            newEvent.id,
            'status_changed',
            organiserId,
            'organiser',
            'Event submitted for approval',
            JSON.stringify({ from_status: 'draft', to_status: 'pending_approval' })
          ]
          
          const statusChangeAuditResult = await client.query(auditQuery, statusChangeAuditValues)
          console.log('✅ Status change audit trail entry created successfully:', statusChangeAuditResult.rows[0])
          
          // Create notification for admins when event is submitted for approval
          console.log('🔔 Creating admin notifications for new event submission...')
          try {
            // Get all active admin users
            const adminResult = await client.query(`
              SELECT u.id, u.email 
              FROM users u
              INNER JOIN admin_users au ON u.email = au.email
              WHERE au.is_active = true
            `)
            
            console.log(`📧 Found ${adminResult.rows.length} active admin users`)
            
            // Create notification for each admin
            for (const admin of adminResult.rows) {
              await createNotification(
                admin.id,
                'status_change',
                'New Event Submitted for Approval',
                `Event "${newEvent.name}" has been submitted for approval and requires review.`,
                `/admin/events/${newEvent.id}`,
                {
                  event_id: newEvent.id,
                  organiser_id: organiserId,
                  event_name: newEvent.name
                }
              )
              console.log(`✅ Notification created for admin: ${admin.email}`)
            }
          } catch (notificationError: any) {
            console.error('❌ Failed to create admin notifications:', notificationError.message)
            // Don't fail the entire operation if notifications fail
          }
          
          // Update the returned event with the new status
          newEvent.status = 'pending_approval'
        }
        
      } catch (auditError: any) {
        console.error('❌ Audit trail creation failed:', auditError.message)
        console.error('❌ Audit trail error details:', auditError)
        throw auditError
      }
    } else {
      console.error('❌ Cannot create audit trail - event was not created successfully')
      throw new Error('Event creation failed - cannot create audit trail')
    }
    
    await client.query('COMMIT')
    
    console.log('✅ Created event:', newEvent.name, 'with ID:', newEvent.id)
    
    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Event created successfully'
    } as ApiResponse<Event>)
    
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('❌ Create event error:', error.message)
    console.error('❌ Full error object:', error)
    console.error('❌ Error stack:', error.stack)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create event'
    } as ApiResponse)
  } finally {
    client.release()
  }
})

/**
 * Update event (organizer/admin only)
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const userId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    console.log('🔍 Updating event:', id, 'by user:', userId)
    
    // Get original event for ownership check and audit trail
    const originalEventResult = await pool.query(
      'SELECT organiser_id, status FROM events WHERE id = $1',
      [id]
    )
    
    if (originalEventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const originalEvent = originalEventResult.rows[0]
    
    // Check ownership (unless admin)
    if (userRole !== 'admin' && originalEvent.organiser_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own events'
      } as ApiResponse)
    }
    
    // Build dynamic update query
    const updateFields = []
    const updateValues = []
    let paramCounter = 1
    
    const allowedFields = [
      'name', 'category', 'event_type', 'start_date', 'end_date', 'start_time', 'registration_deadline', 'venue_name', 
      'address', 'city', 'province', 'country', 'latitude', 'longitude',
      'license_required', 'temp_license_fee', 'license_details',
      'primary_image_url', 'gallery_images', 'description', 'status'
    ]
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCounter}`)
        
        let fieldValue = updates[field]
        
        // Handle special cases
        if (field === 'gallery_images') {
          fieldValue = JSON.stringify(updates[field])
        } else if ((field.includes('date') || field.includes('deadline')) && fieldValue === '') {
          // Convert empty date strings to null for PostgreSQL compatibility
          fieldValue = null
        }
        
        updateValues.push(fieldValue)
        paramCounter++
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      } as ApiResponse)
    }
    
    updateValues.push(id) // Add ID as last parameter
    
    const updateQuery = `
      UPDATE events 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING *
    `
    
    const result = await pool.query(updateQuery, updateValues)
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const updatedEvent = result.rows[0]
    
    // Create audit trail entries and notifications for significant changes
    if (updates.status && updates.status !== originalEvent.status) {
      let actionType = ''
      let message = ''
      let notificationTitle = ''
      let notificationMessage = ''
      
      if (updates.status === 'pending_approval') {
        actionType = 'submitted_for_approval'
        message = 'Event submitted for admin approval'
        notificationTitle = 'Event Submitted for Approval'
        notificationMessage = `Your event "${updatedEvent.name}" has been submitted for approval and is now being reviewed by administrators.`
      } else if (updates.status === 'published') {
        actionType = 'published'
        message = 'Event published and made live'
        notificationTitle = 'Event Published'
        notificationMessage = `Great news! Your event "${updatedEvent.name}" has been approved and is now live for participants to register.`
      } else if (updates.status === 'cancelled') {
        actionType = 'cancelled'
        message = 'Event cancelled'
        notificationTitle = 'Event Cancelled'
        notificationMessage = `Your event "${updatedEvent.name}" has been cancelled.`
      }
      
      if (actionType) {
        // Create audit trail entry
        await createAuditTrailEntry(
          id,
          actionType,
          userId,
          userRole === 'admin' ? 'admin' : 'organiser',
          message
        )
        
        // Create notification for event owner (if status was changed by admin)
        if (userRole === 'admin' && originalEvent.organiser_id !== userId) {
          await createNotification(
            originalEvent.organiser_id,
            'status_change',
            notificationTitle,
            notificationMessage,
            `/dashboard/events/${id}/history`,
            {
              event_id: id,
              previous_status: originalEvent.status,
              new_status: updates.status
            }
          )
        }
        
        // Create notification for admins when event is submitted for approval
        if (updates.status === 'pending_approval' && userRole === 'organiser') {
          // Get all active admin users
          const adminResult = await pool.query(`
            SELECT u.id, u.email 
            FROM users u
            INNER JOIN admin_users au ON u.email = au.email
            WHERE au.is_active = true
          `)
          
          // Create notification for each admin
          for (const admin of adminResult.rows) {
            await createNotification(
              admin.id,
              'status_change',
              'New Event Submitted for Approval',
              `Event "${updatedEvent.name}" has been submitted for approval and requires review.`,
              `/admin/events/${id}`,
              {
                event_id: id,
                organiser_id: originalEvent.organiser_id,
                event_name: updatedEvent.name
              }
            )
          }
        }
      }
    }
    
    // Create audit trail entries and admin notifications for content edits to pending_approval events
    if (originalEvent.status === 'pending_approval' && userRole === 'organiser' && !updates.status) {
      console.log('🔍 Event in pending_approval was edited by organiser - creating audit trail and admin notifications...')
      
      // Create audit trail entry for the edit
      const editedFields = Object.keys(updates).filter(field => field !== 'status')
      const editMessage = `Event content updated by organiser. Fields changed: ${editedFields.join(', ')}`
      
      await createAuditTrailEntry(
        id,
        'content_edited',
        userId,
        'organiser',
        editMessage,
        { edited_fields: editedFields }
      )
      
      // Create notification for admins about the edit
      try {
        // Get all active admin users
        const adminResult = await pool.query(`
          SELECT u.id, u.email 
          FROM users u
          INNER JOIN admin_users au ON u.email = au.email
          WHERE au.is_active = true
        `)
        
        console.log(`📧 Found ${adminResult.rows.length} active admin users for edit notification`)
        
        // Create notification for each admin
        for (const admin of adminResult.rows) {
          await createNotification(
            admin.id,
            'content_edit',
            'Event Under Review Was Edited',
            `Event "${updatedEvent.name}" has been edited by the organiser while under review. Fields changed: ${editedFields.join(', ')}`,
            `/admin/events/${id}`,
            {
              event_id: id,
              organiser_id: originalEvent.organiser_id,
              event_name: updatedEvent.name,
              edited_fields: editedFields
            }
          )
          console.log(`✅ Edit notification created for admin: ${admin.email}`)
        }
      } catch (notificationError: any) {
        console.error('❌ Failed to create edit notifications:', notificationError.message)
        // Don't fail the entire operation if notifications fail
      }
    }
    
    // Handle distances update
    if (updates.distances !== undefined) {
      console.log('🔍 Updating distances:', updates.distances)
      
      // Delete existing distances
      await pool.query('DELETE FROM event_distances WHERE event_id = $1', [id])
      console.log('✅ Deleted existing distances')
      
      // Insert new distances
      if (updates.distances && updates.distances.length > 0) {
        for (const distance of updates.distances) {
          await pool.query(`
            INSERT INTO event_distances (
              event_id, name, distance_km, price, min_age, entry_limit,
              start_time, free_for_seniors, free_for_disability, senior_age_threshold
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            id,
            distance.name,
            distance.distance_km,
            distance.price,
            distance.min_age,
            distance.entry_limit,
            distance.start_time,
            distance.free_for_seniors || false,
            distance.free_for_disability || false,
            distance.senior_age_threshold || 65
          ])
        }
        console.log('✅ Created new distances')
      }
    }
    
    // Handle merchandise update
    if (updates.merchandise !== undefined) {
      console.log('🔍 Updating merchandise:', updates.merchandise)
      
      // Delete existing merchandise and variations
      await pool.query('DELETE FROM merchandise_variations WHERE merchandise_id IN (SELECT id FROM event_merchandise WHERE event_id = $1)', [id])
      await pool.query('DELETE FROM event_merchandise WHERE event_id = $1', [id])
      console.log('✅ Deleted existing merchandise')
      
      // Insert new merchandise
      if (updates.merchandise && updates.merchandise.length > 0) {
        for (const item of updates.merchandise) {
          // Extract variations from the item
          const { variations, ...merchandiseData } = item
          
          // Create the merchandise item
          const merchandiseResult = await pool.query(`
            INSERT INTO event_merchandise (
              event_id, name, description, price, image_url
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id
          `, [
            id,
            merchandiseData.name,
            merchandiseData.description,
            merchandiseData.price,
            merchandiseData.image_url
          ])
          
          const merchandiseId = merchandiseResult.rows[0].id
          
          // Create variations if provided
          if (variations && variations.length > 0) {
            for (const variation of variations) {
              await pool.query(`
                INSERT INTO merchandise_variations (
                  merchandise_id, variation_name, variation_options
                ) VALUES ($1, $2, $3)
              `, [
                merchandiseId,
                variation.name,
                JSON.stringify(variation.options || [])
              ])
            }
          }
        }
        console.log('✅ Created new merchandise')
      }
    }
    
    console.log('✅ Updated event:', updatedEvent.name)
    
    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    } as ApiResponse<Event>)
    
  } catch (error: any) {
    console.error('❌ Update event error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to update event'
    } as ApiResponse)
  }
})

/**
 * Delete event (organizer/admin only)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    console.log('🔍 Deleting event:', id, 'by user:', userId)
    
    // Check ownership (unless admin)
    if (userRole !== 'admin') {
      const ownerCheck = await pool.query(
        'SELECT organiser_id, name FROM events WHERE id = $1',
        [id]
      )
      
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        } as ApiResponse)
      }
      
      if (ownerCheck.rows[0].organiser_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own events'
        } as ApiResponse)
      }
    }
    
    // Delete event (cascade will handle related tables)
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING name', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    console.log('✅ Deleted event:', result.rows[0].name)
    
    res.json({
      success: true,
      message: `Event "${result.rows[0].name}" deleted successfully`
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Delete event error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to delete event'
    } as ApiResponse)
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Get all events (admin only)
 */
router.get('/admin/all', authenticateToken, requireOrganiserOrAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔍 Admin fetching all events...')
    
    const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        u.email AS organiser_email,
        COUNT(ed.id) as distance_count,
        COUNT(em.id) as merchandise_count
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      LEFT JOIN event_distances ed ON e.id = ed.event_id
      LEFT JOIN event_merchandise em ON e.id = em.event_id
      GROUP BY e.id, u.first_name, u.last_name, u.email
      ORDER BY e.created_at DESC
    `
    
    const result = await pool.query(query)
    
    console.log(`✅ Admin found ${result.rows.length} events`)
    
    res.json({
      success: true,
      data: result.rows
    } as ApiResponse<Event[]>)
    
  } catch (error: any) {
    console.error('❌ Admin get all events error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    } as ApiResponse)
  }
})

// ============================================
// EVENT AUDIT TRAIL ROUTE
// ============================================

// Create audit trail entry (for change requests, etc.)
router.post('/:id/audit-trail', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { action_type, message, metadata } = req.body
    const userId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    // Check if user can create audit trail entries for this event
    if (userRole !== 'admin') {
      const ownerCheck = await pool.query(
        'SELECT organiser_id FROM events WHERE id = $1',
        [id]
      )
      
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        } as ApiResponse)
      }
      
      if (ownerCheck.rows[0].organiser_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only create audit entries for your own events'
        } as ApiResponse)
      }
    }
    
    const entry = await createAuditTrailEntry(
      id,
      action_type,
      userId,
      userRole === 'admin' ? 'admin' : 'organiser',
      message,
      metadata
    )
    
    // Create notification for admins when organiser makes a change request
    if (action_type === 'change_requested' && userRole === 'organiser') {
      console.log('🔔 Creating admin notifications for change request...')
      try {
        // Get event details for the notification
        const eventResult = await pool.query(
          'SELECT name, organiser_id FROM events WHERE id = $1',
          [id]
        )
        
        if (eventResult.rows.length > 0) {
          const event = eventResult.rows[0]
          
          // Get all active admin users
          const adminResult = await pool.query(`
            SELECT u.id, u.email 
            FROM users u
            INNER JOIN admin_users au ON u.email = au.email
            WHERE au.is_active = true
          `)
          
          console.log(`📧 Found ${adminResult.rows.length} active admin users for change request notification`)
          
          // Create notification for each admin
          for (const admin of adminResult.rows) {
            await createNotification(
              admin.id,
              'change_request',
              'Event Change Request',
              `Organiser has requested changes to event "${event.name}". Request: ${message}`,
              `/admin/events/${id}`,
              {
                event_id: id,
                organiser_id: event.organiser_id,
                event_name: event.name,
                change_request: message
              }
            )
            console.log(`✅ Change request notification created for admin: ${admin.email}`)
          }
        }
      } catch (notificationError: any) {
        console.error('❌ Failed to create change request notifications:', notificationError.message)
        // Don't fail the entire operation if notifications fail
      }
    }
    
    res.status(201).json({
      success: true,
      data: entry,
      message: 'Audit trail entry created successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Create audit trail entry error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to create audit trail entry'
    } as ApiResponse)
  }
})

router.get('/:id/audit-trail', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    // Check if user can access this event's audit trail
    if (userRole !== 'admin') {
      const ownerCheck = await pool.query(
        'SELECT organiser_id FROM events WHERE id = $1',
        [id]
      )
      
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        } as ApiResponse)
      }
      
      if (ownerCheck.rows[0].organiser_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view audit trail for your own events'
        } as ApiResponse)
      }
    }
    
    const auditTrail = await getEventAuditTrail(id)
    
    res.json({
      success: true,
      data: auditTrail,
      message: 'Audit trail retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get audit trail error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit trail'
    } as ApiResponse)
  }
})

// ============================================
// ADMIN EVENT ROUTES
// ============================================

// Get all events for admin (including drafts, pending, etc.)
router.get('/admin/all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can access this endpoint'
      } as ApiResponse)
    }
    
    const query = `
      SELECT 
        e.*,
        u.first_name as organiser_first_name,
        u.last_name as organiser_last_name,
        u.email as organiser_email,
        COUNT(ed.id) as distance_count,
        COUNT(em.id) as merchandise_count
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      LEFT JOIN event_distances ed ON e.id = ed.event_id
      LEFT JOIN event_merchandise em ON e.id = em.event_id
      GROUP BY e.id, u.id
      ORDER BY e.created_at DESC
    `
    
    const result = await pool.query(query)
    
    console.log('✅ Admin retrieved', result.rows.length, 'events')
    
    res.json({
      success: true,
      data: result.rows,
      message: 'All events retrieved successfully'
    } as ApiResponse<Event[]>)
    
  } catch (error: any) {
    console.error('❌ Admin get all events error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    } as ApiResponse)
  }
})

// Admin action: Update event status with notification
router.put('/admin/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, adminNote } = req.body
    const adminId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update event status'
      } as ApiResponse)
    }
    
    if (!['draft', 'pending_approval', 'published', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      } as ApiResponse)
    }
    
    // Get the event and current status
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    )
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const event = eventResult.rows[0]
    const previousStatus = event.status
    
    // Update event status
    const updateResult = await pool.query(
      'UPDATE events SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    )
    
    const updatedEvent = updateResult.rows[0]
    
    // Create audit trail entry
    let auditMessage = `Admin updated event status from ${previousStatus} to ${status}`
    if (adminNote) {
      auditMessage += `. Note: ${adminNote}`
    }
    
    await createAuditTrailEntry(
      id,
      'admin_updated',
      adminId,
      'admin',
      auditMessage
    )
    
    // Create notification for organiser
    let notificationTitle = ''
    let notificationMessage = ''
    
    switch (status) {
      case 'published':
        notificationTitle = 'Event Approved & Published!'
        notificationMessage = `Great news! Your event "${event.name}" has been approved and is now live for participants to register.`
        break
      case 'cancelled':
        notificationTitle = 'Event Rejected'
        notificationMessage = `Your event "${event.name}" has been rejected.${adminNote ? ` Admin note: ${adminNote}` : ''}`
        break
      case 'pending_approval':
        notificationTitle = 'Event Returned for Review'
        notificationMessage = `Your event "${event.name}" requires additional information.${adminNote ? ` Admin note: ${adminNote}` : ''}`
        break
    }
    
    if (notificationTitle) {
      await createNotification(
        event.organiser_id,
        'status_change',
        notificationTitle,
        notificationMessage,
        `/dashboard/events/${id}/history`,
        {
          event_id: id,
          previous_status: previousStatus,
          new_status: status,
          admin_note: adminNote
        }
      )
    }
    
    // If there's an admin note, also send as a message
    if (adminNote) {
      await pool.query(
        `INSERT INTO messages (event_id, sender_id, recipient_id, subject, body)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          adminId,
          event.organiser_id,
          `Event ${status === 'published' ? 'Approved' : status === 'cancelled' ? 'Rejected' : 'Update Required'}: ${event.name}`,
          adminNote
        ]
      )
      
      // Create notification for the message
      await createNotification(
        event.organiser_id,
        'message',
        'New Message from Admin',
        `You have received a message regarding your event "${event.name}".`,
        '/dashboard/messages',
        { event_id: id }
      )
    }
    
    res.json({
      success: true,
      data: updatedEvent,
      message: 'Event status updated successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Admin update event status error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to update event status'
    } as ApiResponse)
  }
})

// Admin statistics endpoint
router.get('/admin/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can access this endpoint'
      } as ApiResponse)
    }
    
    // Get event stats
    const eventStatsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as active_events,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_events,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_events,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_events
      FROM events
    `
    
    // Get organiser stats
    const organiserStatsQuery = `
      SELECT COUNT(*) as total_organisers
      FROM users
      WHERE role = 'organiser'
    `
    
    const [eventStats, organiserStats] = await Promise.all([
      pool.query(eventStatsQuery),
      pool.query(organiserStatsQuery)
    ])
    
    const stats = {
      totalEvents: parseInt(eventStats.rows[0].total_events),
      activeEvents: parseInt(eventStats.rows[0].active_events),
      pendingEvents: parseInt(eventStats.rows[0].pending_events),
      draftEvents: parseInt(eventStats.rows[0].draft_events),
      cancelledEvents: parseInt(eventStats.rows[0].cancelled_events),
      totalOrganisers: parseInt(organiserStats.rows[0].total_organisers)
    }
    
    console.log('✅ Admin stats retrieved:', stats)
    
    res.json({
      success: true,
      data: stats,
      message: 'Admin statistics retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Admin get stats error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin statistics'
    } as ApiResponse)
  }
})

// Admin recent events endpoint
router.get('/admin/recent', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can access this endpoint'
      } as ApiResponse)
    }
    
    const limit = parseInt(req.query.limit as string) || 5
    
    const query = `
      SELECT 
        e.id,
        e.name,
        e.status,
        e.created_at,
        e.updated_at,
        u.first_name as organiser_first_name,
        u.last_name as organiser_last_name,
        u.email as organiser_email
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      ORDER BY e.updated_at DESC
      LIMIT $1
    `
    
    const result = await pool.query(query, [limit])
    
    // Format the results with relative time
    const recentEvents = result.rows.map(event => ({
      ...event,
      organiser_name: `${event.organiser_first_name} ${event.organiser_last_name}`,
      time_ago: getTimeAgo(event.updated_at)
    }))
    
    console.log('✅ Admin recent events retrieved:', recentEvents.length)
    
    res.json({
      success: true,
      data: recentEvents,
      message: 'Recent events retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Admin get recent events error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent events'
    } as ApiResponse)
  }
})

/**
 * Update event section (admin only)
 */
router.put('/admin/:id/section', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { section, data } = req.body
    const adminId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update event sections'
      } as ApiResponse)
    }
    
    console.log(`🔧 Admin updating event ${id} section: ${section}`)
    
    // Validate section
    const validSections = ['overview', 'location', 'distances', 'merchandise']
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section. Must be one of: overview, location, distances, merchandise'
      } as ApiResponse)
    }
    
    // Check if event exists
    const eventCheck = await pool.query('SELECT id, name, status, organiser_id FROM events WHERE id = $1', [id])
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const event = eventCheck.rows[0]
    
    // Update based on section
    let updateQuery = ''
    let updateValues: any[] = []
    let updateFields: string[] = []
    
    switch (section) {
      case 'overview':
        if (data.name) { updateFields.push('name = $' + (updateValues.length + 1)); updateValues.push(data.name) }
        if (data.category) { updateFields.push('category = $' + (updateValues.length + 1)); updateValues.push(data.category) }
        if (data.event_type) { updateFields.push('event_type = $' + (updateValues.length + 1)); updateValues.push(data.event_type) }
        if (data.description !== undefined) { updateFields.push('description = $' + (updateValues.length + 1)); updateValues.push(data.description) }
        if (data.start_date) { updateFields.push('start_date = $' + (updateValues.length + 1)); updateValues.push(data.start_date) }
        if (data.end_date) { updateFields.push('end_date = $' + (updateValues.length + 1)); updateValues.push(data.end_date) }
        if (data.start_time) { updateFields.push('start_time = $' + (updateValues.length + 1)); updateValues.push(data.start_time) }
        if (data.registration_deadline) { updateFields.push('registration_deadline = $' + (updateValues.length + 1)); updateValues.push(data.registration_deadline) }
        if (data.max_participants !== undefined) { updateFields.push('max_participants = $' + (updateValues.length + 1)); updateValues.push(data.max_participants) }
        if (data.entry_fee !== undefined) { updateFields.push('entry_fee = $' + (updateValues.length + 1)); updateValues.push(data.entry_fee) }
        if (data.license_required !== undefined) { updateFields.push('license_required = $' + (updateValues.length + 1)); updateValues.push(data.license_required) }
        if (data.temp_license_fee !== undefined) { updateFields.push('temp_license_fee = $' + (updateValues.length + 1)); updateValues.push(data.temp_license_fee) }
        if (data.license_details) { updateFields.push('license_details = $' + (updateValues.length + 1)); updateValues.push(data.license_details) }
        break
        
      case 'location':
        if (data.venue_name) { updateFields.push('venue_name = $' + (updateValues.length + 1)); updateValues.push(data.venue_name) }
        if (data.address) { updateFields.push('address = $' + (updateValues.length + 1)); updateValues.push(data.address) }
        if (data.city) { updateFields.push('city = $' + (updateValues.length + 1)); updateValues.push(data.city) }
        if (data.province) { updateFields.push('province = $' + (updateValues.length + 1)); updateValues.push(data.province) }
        break
        
      case 'distances':
        // Handle distances separately as they're in a different table
        if (data.distances && Array.isArray(data.distances) && data.distances.length > 0) {
          // Delete existing distances
          await pool.query('DELETE FROM event_distances WHERE event_id = $1', [id])
          
          // Insert new distances
          for (const distance of data.distances) {
            await pool.query(
              'INSERT INTO event_distances (event_id, name, distance_km, price, min_age, entry_limit, start_time, free_for_seniors, free_for_disability, senior_age_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
              [
                id, 
                distance.name || '', 
                distance.distance_km || 0, 
                distance.price || 0,
                distance.min_age || null,
                distance.entry_limit || null,
                distance.start_time || null,
                distance.free_for_seniors || false,
                distance.free_for_disability || false,
                distance.senior_age_threshold || null
              ]
            )
          }
        }
        break
        
      case 'merchandise':
        // Handle merchandise separately as they're in different tables
        if (data.merchandise && Array.isArray(data.merchandise)) {
          // Delete existing merchandise and variations
          await pool.query('DELETE FROM merchandise_variations WHERE merchandise_id IN (SELECT id FROM event_merchandise WHERE event_id = $1)', [id])
          await pool.query('DELETE FROM event_merchandise WHERE event_id = $1', [id])
          
          // Insert new merchandise
          for (const item of data.merchandise) {
            const merchResult = await pool.query(
              'INSERT INTO event_merchandise (event_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING id',
              [id, item.name, item.description, item.base_price || item.price]
            )
            
            const merchandiseId = merchResult.rows[0].id
            
            // Insert variations
            if (item.variations && Array.isArray(item.variations)) {
              for (const variation of item.variations) {
                // Ensure variation_options is properly formatted as JSON
                let variationOptions = variation.variation_options
                if (typeof variationOptions === 'string') {
                  try {
                    variationOptions = JSON.parse(variationOptions)
                  } catch (e) {
                    // If it's not valid JSON, treat it as an array
                    variationOptions = [variationOptions]
                  }
                } else if (!Array.isArray(variationOptions)) {
                  variationOptions = []
                }
                
                await pool.query(
                  'INSERT INTO merchandise_variations (merchandise_id, variation_name, variation_options) VALUES ($1, $2, $3)',
                  [merchandiseId, variation.variation_name, JSON.stringify(variationOptions)]
                )
              }
            }
          }
        }
        break
    }
    
    // Update main event table if there are fields to update
    if (updateFields.length > 0) {
      updateQuery = `UPDATE events SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${updateValues.length + 1}`
      updateValues.push(id)
      
      await pool.query(updateQuery, updateValues)
    }
    
    // Create audit trail entry
    await createAuditTrailEntry(
      id,
      'admin_edit_section',
      adminId,
      'admin',
      `Admin updated ${section} section`,
      {
        section,
        changes: data
      }
    )
    
    // Create notification for organiser if event is published
    if (event.status === 'published') {
      try {
        await createNotification(
          event.organiser_id,
          'admin_edit',
          'Event Updated by Administrator',
          `An administrator has updated the ${section} section of your published event "${event.name}".`,
          `/dashboard/events/${id}/history`,
          {
            event_id: id,
            admin_id: adminId,
            section: section,
            event_name: event.name
          }
        )
        console.log(`✅ Notification created for organiser about admin edit to published event`)
      } catch (notificationError: any) {
        console.error('❌ Failed to create organiser notification for admin edit:', notificationError.message)
        // Don't fail the entire operation if notifications fail
      }
    }
    
    console.log(`✅ Admin successfully updated event ${id} ${section} section`)
    
    res.json({
      success: true,
      message: `${section} section updated successfully`,
      data: {
        eventId: id,
        section,
        updatedFields: updateFields
      }
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Admin update event section error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to update event section'
    } as ApiResponse)
  }
})

// Helper function to get relative time
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}

// ============================================
// ADMIN COMMENTS ROUTES
// ============================================

// Get admin comments for an event
router.get('/:id/admin-comments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    // Check if user can access this event's admin comments
    if (userRole !== 'admin') {
      const ownerCheck = await pool.query(
        'SELECT organiser_id FROM events WHERE id = $1',
        [id]
      )
      
      if (ownerCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        } as ApiResponse)
      }
      
      if (ownerCheck.rows[0].organiser_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view admin comments for your own events'
        } as ApiResponse)
      }
    }
    
    const query = `
      SELECT 
        ac.*,
        u.first_name,
        u.last_name,
        u.email
      FROM admin_comments ac
      JOIN users u ON ac.admin_id = u.id
      WHERE ac.event_id = $1 AND ac.status = 'active'
      ORDER BY ac.created_at DESC
    `
    
    const result = await pool.query(query, [id])
    
    res.json({
      success: true,
      data: result.rows,
      message: 'Admin comments retrieved successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Get admin comments error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin comments'
    } as ApiResponse)
  }
})

// Create admin comment (admin only)
router.post('/:id/admin-comments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { section, comment } = req.body
    const adminId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can create admin comments'
      } as ApiResponse)
    }
    
    if (!section || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: section, comment'
      } as ApiResponse)
    }
    
    // Verify event exists
    const eventCheck = await pool.query('SELECT id, name, organiser_id FROM events WHERE id = $1', [id])
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      } as ApiResponse)
    }
    
    const event = eventCheck.rows[0]
    
    // Create admin comment
    const query = `
      INSERT INTO admin_comments (event_id, admin_id, section, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    const result = await pool.query(query, [id, adminId, section, comment])
    const newComment = result.rows[0]
    
    // Create notification for organiser
    await createNotification(
      event.organiser_id,
      'admin_comment',
      'New Admin Comment',
      `You have received a new comment from an administrator on your event "${event.name}" (${section} section).`,
      `/dashboard/events/${id}/comments`,
      {
        event_id: id,
        comment_id: newComment.id,
        section: section
      }
    )
    
    res.status(201).json({
      success: true,
      data: newComment,
      message: 'Admin comment created successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Create admin comment error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to create admin comment'
    } as ApiResponse)
  }
})

// Update admin comment (admin only)
router.put('/admin-comments/:commentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params
    const { comment, status } = req.body
    const adminId = req.localUser!.userId
    const userRole = req.localUser!.role
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can update admin comments'
      } as ApiResponse)
    }
    
    // Build update query
    const updateFields = []
    const updateValues = []
    let paramCounter = 1
    
    if (comment !== undefined) {
      updateFields.push(`comment = $${paramCounter}`)
      updateValues.push(comment)
      paramCounter++
    }
    
    if (status !== undefined) {
      updateFields.push(`status = $${paramCounter}`)
      updateValues.push(status)
      paramCounter++
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      } as ApiResponse)
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    updateValues.push(commentId)
    
    const query = `
      UPDATE admin_comments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter} AND admin_id = $${paramCounter + 1}
      RETURNING *
    `
    
    updateValues.push(adminId)
    
    const result = await pool.query(query, updateValues)
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin comment not found or you do not have permission to update it'
      } as ApiResponse)
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Admin comment updated successfully'
    } as ApiResponse)
    
  } catch (error: any) {
    console.error('❌ Update admin comment error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to update admin comment'
    } as ApiResponse)
  }
})

/**
 * Get participant analytics for an organiser's event
 */
router.get('/:eventId/participant-analytics', authenticateToken, requireOrganiserOrAdmin, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const userId = req.localUser!.userId

    // Verify the user has access to this event
    const eventCheck = await pool.query(`
      SELECT e.id, e.name, e.start_date, e.start_time, e.city,
             u.role, u.email
      FROM events e
      LEFT JOIN users u ON e.organiser_id = u.id
      WHERE e.id = $1 AND (e.organiser_id = $2 OR u.role = 'admin')
    `, [eventId, userId])

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found or access denied'
      })
    }

    const event = eventCheck.rows[0]

    // Get distance details with participant counts
    const distancesResult = await pool.query(`
      SELECT 
        ed.id,
        ed.name,
        ed.price,
        ed.entry_limit,
        ed.min_age,
        ed.start_time,
        COUNT(t.id) as participant_count,
        COUNT(CASE WHEN t.status = 'active' THEN 1 END) as active_participants
      FROM event_distances ed
      LEFT JOIN tickets t ON ed.id = t.distance_id AND t.event_id = $1
      WHERE ed.event_id = $1
      GROUP BY ed.id, ed.name, ed.price, ed.entry_limit, ed.min_age, ed.start_time
      ORDER BY ed.price ASC
    `, [eventId])

    // Get total participants
    const totalParticipantsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_participants,
        COUNT(CASE WHEN participant_disabled = true THEN 1 END) as disabled_participants
      FROM tickets 
      WHERE event_id = $1
    `, [eventId])

    // Get participant details for export
    const participantsResult = await pool.query(`
      SELECT 
        t.id as ticket_id,
        t.ticket_number,
        t.participant_first_name,
        t.participant_last_name,
        t.participant_email,
        t.participant_mobile,
        t.participant_date_of_birth,
        t.participant_disabled,
        t.participant_medical_aid_name,
        t.participant_medical_aid_number,
        t.emergency_contact_name,
        t.emergency_contact_number,
        t.amount,
        t.status,
        t.created_at,
        t.requires_temp_license,
        t.permanent_license_number,
        ed.name as distance_name,
        ed.price as distance_price,
        o.account_holder_first_name,
        o.account_holder_last_name,
        o.account_holder_email
      FROM tickets t
      JOIN event_distances ed ON t.distance_id = ed.id
      JOIN orders o ON t.order_id = o.id
      WHERE t.event_id = $1
      ORDER BY t.created_at DESC
    `, [eventId])

    // Calculate total entry limit
    const totalEntryLimit = distancesResult.rows.reduce((sum, distance) => {
      return sum + (distance.entry_limit || 0)
    }, 0)

    const totalParticipants = totalParticipantsResult.rows[0]
    const totalActiveParticipants = totalParticipants.active_participants || 0

    // Prepare analytics data
    const analytics = {
      event: {
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        start_time: event.start_time,
        city: event.city
      },
      summary: {
        total_participants: totalParticipants.total_participants || 0,
        active_participants: totalActiveParticipants,
        disabled_participants: totalParticipants.disabled_participants || 0,
        total_entry_limit: totalEntryLimit,
        utilization_percentage: totalEntryLimit > 0 ? Math.round((totalActiveParticipants / totalEntryLimit) * 100) : 0
      },
      distances: distancesResult.rows.map(distance => ({
        id: distance.id,
        name: distance.name,
        price: distance.price,
        entry_limit: distance.entry_limit,
        min_age: distance.min_age,
        start_time: distance.start_time,
        participant_count: parseInt(distance.participant_count) || 0,
        active_participants: parseInt(distance.active_participants) || 0,
        utilization_percentage: distance.entry_limit > 0 ? Math.round((parseInt(distance.active_participants) / distance.entry_limit) * 100) : 0
      })),
      participants: participantsResult.rows
    }

    res.json({
      success: true,
      data: analytics
    })

  } catch (error: any) {
    console.error('Get participant analytics error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get participant analytics'
    })
  }
})

export default router
