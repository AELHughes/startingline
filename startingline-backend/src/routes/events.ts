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
    
    // ✅ SIMPLE SOLUTION: Check what organiser_id actually works
    // From debug: Edward uses auth_user_id and it works
    // Let's try both and see which one the foreign key accepts
    
    console.log('🔍 Available IDs for organiser_id:')
    console.log('  - auth_user_id:', userLookup.auth_user_id)
    console.log('  - public user_id:', userLookup.id)
    
    // Let's check what existing events use by querying a working event
    try {
      const { data: existingEvents } = await supabaseAdmin
        .from('events')
        .select('organiser_id, organiser_name')
        .limit(3)
      
      console.log('🔍 Sample existing events organiser_id values:', existingEvents)
    } catch (queryError) {
      console.log('⚠️ Could not query existing events:', queryError)
    }
    
    // ✅ CORRECT SOLUTION: Use auth_user_id (as established previously)
    console.log('🔍 Using auth_user_id as organiser_id (correct approach):', userLookup.auth_user_id)
    eventFields.organiser_id = userLookup.auth_user_id
    
    // 🔍 DEBUGGING: Check if Sam's auth user actually exists in Supabase
    console.log('🔍 Verifying auth user exists in Supabase auth system...')
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userLookup.auth_user_id)
      
      if (authError) {
        console.log('❌ Error fetching auth user:', authError.message, authError.code)
      } else if (authUser?.user) {
        console.log('✅ Auth user EXISTS in Supabase:', {
          id: authUser.user.id,
          email: authUser.user.email,
          created_at: authUser.user.created_at,
          email_confirmed_at: authUser.user.email_confirmed_at
        })
      } else {
        console.log('❌ Auth user NOT FOUND - this explains the foreign key error!')
      }
    } catch (authCheckError) {
      console.log('❌ Exception checking auth user:', authCheckError)
    }
    
    try {
      // Create the event
      const event = await supabase.createEvent(eventFields)
      console.log('✅ Event created:', event.id)
    } catch (createError) {
      console.log('❌ Event creation failed with auth_user_id:', createError.message)
      
      // If foreign key constraint, try to create the auth user first
      if (createError.message.includes('foreign key constraint')) {
        console.log('🔧 Attempting to create missing auth user record...')
        
        try {
          const { error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userLookup.email,
            email_confirm: true,
            user_metadata: {
              first_name: userLookup.first_name,
              last_name: userLookup.last_name,
              role: userLookup.role
            }
          })
          
          if (authError && !authError.message.includes('already registered')) {
            console.log('⚠️ Could not create auth user:', authError.message)
            throw createError // Re-throw original error
          }
          
          console.log('✅ Auth user created/confirmed, retrying event creation...')
          const event = await supabase.createEvent(eventFields)
          console.log('✅ Event created after auth user fix:', event.id)
          
        } catch (authFixError) {
          console.log('❌ Auth user creation failed:', authFixError)
          throw createError // Re-throw original error
        }
      } else {
        throw createError // Re-throw if not foreign key issue
      }
    }
    
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
