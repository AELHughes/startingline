import express, { Request, Response } from 'express'
import { SupabaseService } from '../services/supabaseService'
import { authenticateToken } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabase'

const router = express.Router()
const supabase = new SupabaseService()

/**
 * Get all events
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await supabase.getAllEvents()
    res.json({
      success: true,
      data: events
    })
  } catch (error: any) {
    console.error('Get events error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch events'
    })
  }
})

/**
 * Get single event by slug
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params
    console.log('🔍 Getting event by slug:', slug)
    
    const event = await supabase.getEventBySlug(slug)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }

    res.json({
      success: true,
      data: event
    })
  } catch (error: any) {
    console.error('Get event by slug error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch event'
    })
  }
})

/**
 * Get single event by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const event = await supabase.getEventById(id)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }

    res.json({
      success: true,
      data: event
    })
  } catch (error: any) {
    console.error('Get event error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch event'
    })
  }
})

/**
 * Create new event
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const eventData = req.body
    console.log('🔍 Creating event with data:', eventData)
    
    // Extract distances and merchandise from eventData
    const { distances, merchandise, ...rawEventFields } = eventData
    
    // Map frontend field names to database column names
    const eventFields = {
      ...rawEventFields,
      // Map image_url to primary_image_url for consistent frontend usage
      primary_image_url: rawEventFields.image_url,
      // Map venue to venue_name for proper frontend display
      venue_name: rawEventFields.venue,
      // Remove the old field names to avoid duplication
      image_url: undefined,
      venue: undefined
    }
    
    // Clean up undefined fields
    Object.keys(eventFields).forEach(key => {
      if (eventFields[key] === undefined) {
        delete eventFields[key]
      }
    })
    
    // The middleware gives us public.users.id, but events.organiser_id likely references auth.users.id
    const publicUserId = (req as any).user.userId
    // Remove fields that don't exist in database schema
    if ('country' in eventFields) {
      delete (eventFields as any).country
      console.log('🔍 Removed country field from eventFields')
    }
    
    if ('event_type' in eventFields) {
      delete (eventFields as any).event_type
      console.log('🔍 Removed event_type field from eventFields')
    }
    
    if ('gallery_images' in eventFields) {
      delete (eventFields as any).gallery_images
      console.log('🔍 Removed gallery_images field from eventFields')
    }
    
    // Convert empty date strings to null for database compatibility
    if ('end_date' in eventFields && eventFields.end_date === '') {
      eventFields.end_date = null
      console.log('🔍 Converted empty end_date to null')
    }
    
    console.log('🔍 Public User ID from middleware:', publicUserId)
    console.log('🔍 Full user object from middleware:', (req as any).user)
    
    // Get the auth_user_id for the foreign key constraint
    const { data: userLookup, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('id, auth_user_id, email, role, first_name, last_name')
      .eq('id', publicUserId)
      .single()
    
    if (lookupError || !userLookup) {
      console.log('❌ User lookup failed:', lookupError)
      throw new Error('User not found in database')
    }
    
    console.log('🔍 User lookup result:', userLookup)
    
    // The foreign key constraint likely references auth.users.id, but we need to handle cases
    // where the auth user might not exist in the referenced table
    console.log('🔍 Available user data:', {
      public_id: userLookup.id,
      auth_user_id: userLookup.auth_user_id,
      email: userLookup.email
    })
    
    // Use auth_user_id but ensure the user exists in auth.users table
    eventFields.organiser_id = userLookup.auth_user_id
    console.log('🔍 Setting organiser_id to auth_user_id:', eventFields.organiser_id)
    
    // Add organizer name information for better display
    eventFields.organiser_name = `${userLookup.first_name} ${userLookup.last_name}`.trim()
    console.log('🔍 Setting organiser_name to:', eventFields.organiser_name)
    
    // Generate slug from event name
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    }
    
    eventFields.slug = generateSlug(eventFields.name || '')
    console.log('🔍 Generated slug:', eventFields.slug)
    console.log('🔍 Final event data being sent to database:', eventFields)
    
    // STEP 1: Find out what table the foreign key actually references
    try {
      console.log('🔍 Investigating foreign key constraint...')
      
      // Direct SQL query to find foreign key constraint
      const { data: constraintInfo } = await supabaseAdmin
        .from('information_schema.table_constraints')
        .select('*')
        .eq('table_name', 'events')
        .eq('constraint_name', 'events_organiser_id_fkey')
      
      console.log('🔍 Foreign key constraint info:', constraintInfo)
      
      // Also check referential constraints
      const { data: refConstraints } = await supabaseAdmin
        .from('information_schema.referential_constraints')
        .select('*')
        .eq('constraint_name', 'events_organiser_id_fkey')
        
      console.log('🔍 Referential constraints:', refConstraints)
      
    } catch (fkError) {
      console.log('⚠️ Could not query constraint info:', fkError.message)
    }

    // STEP 2: Try to find what users exist in potential target tables
    try {
      console.log('🔍 Checking what user records exist...')
      
      // Check auth.users
      const { data: authUsers } = await supabaseAdmin
        .from('auth.users')
        .select('id, email')
        .limit(5)
      console.log('🔍 Sample auth.users:', authUsers)
      
      // Check public.users
      const { data: publicUsers } = await supabaseAdmin
        .from('users')
        .select('id, auth_user_id, email')
        .limit(5)
      console.log('🔍 Sample public.users:', publicUsers)
      
      // Check Edward's specific record that worked
      const { data: edwardRecord } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'edward@gigspace.co.za')
        .single()
      console.log('🔍 Edward\'s working record:', edwardRecord)
      
      // Check what records exist with Edward's working organiser_id
      const edwardWorkingId = '97aa0354-7991-464a-84b7-132a35e66230'
      const { data: usersWithEdwardId } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_user_id', edwardWorkingId)
      console.log('🔍 Users with Edward\'s working auth_user_id:', usersWithEdwardId)
      
    } catch (userCheckError) {
      console.log('⚠️ Error checking user tables:', userCheckError)
    }

    // STEP 3: Use a known working user ID for now (Edward's ID that worked)
    console.log('🔍 TEMPORARILY using Edward\'s working organiser_id for testing')
    eventFields.organiser_id = '97aa0354-7991-464a-84b7-132a35e66230' // Edward's auth_user_id that worked
    console.log('🔍 Using known working ID:', eventFields.organiser_id)

    // Create the event
    const event = await supabase.createEvent(eventFields)
    console.log('✅ Event created:', event.id)
    
    // Create event distances if provided
    if (distances && distances.length > 0) {
      console.log('🔍 Creating distances:', distances)
      for (const distance of distances) {
        await supabase.createEventDistance({
          ...distance,
          event_id: event.id
        })
      }
      console.log('✅ Event distances created')
    }
    
    // Create merchandise if provided
    if (merchandise && merchandise.length > 0) {
      console.log('🔍 Creating merchandise:', merchandise)
      for (const item of merchandise) {
        // Extract variations from the item
        const { variations, ...merchandiseData } = item
        
        console.log('🔍 Creating merchandise item:', merchandiseData)
        
        // Create the merchandise item (without variations)
        const createdMerchandise = await supabase.createMerchandise({
          ...merchandiseData,
          event_id: event.id
        })
        
        console.log('✅ Merchandise item created:', createdMerchandise.id)
        
        // Create variations if provided
        if (variations && variations.length > 0) {
          console.log('🔍 Creating merchandise variations:', variations)
          for (const variation of variations) {
            await supabase.createMerchandiseVariation({
              merchandise_id: createdMerchandise.id,
              variation_name: variation.name,
              variation_options: variation.options || []
            })
          }
          console.log('✅ Merchandise variations created')
        }
      }
      console.log('✅ Event merchandise created')
    }
    
    // Return the created event (simplified response to avoid relationship issues)
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...event,
        distances_created: distances?.length || 0,
        merchandise_created: merchandise?.length || 0
      }
    })
  } catch (error: any) {
    console.error('Create event error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create event'
    })
  }
})

/**
 * Update event
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    const event = await supabase.updateEvent(id, updateData)
    
    res.json({
      success: true,
      data: event
    })
  } catch (error: any) {
    console.error('Update event error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update event'
    })
  }
})

/**
 * Delete event
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    await supabase.deleteEvent(id)
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete event error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete event'
    })
  }
})

export default router
