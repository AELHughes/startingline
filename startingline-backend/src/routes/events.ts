import express, { Request, Response } from 'express'
import { SupabaseService } from '../services/supabaseService'
import { authenticateToken as authTokenOld } from '../middleware/auth'
import { authenticateToken, requireOrganiser, requireOrganiserOrAdmin, optionalAuth } from '../middleware/auth-local'
import { supabaseAdmin } from '../lib/supabase'
import { pool } from '../lib/database'

const router = express.Router()

// Debug route to check foreign key constraint and compare auth users
router.get('/debug-constraint', async (req: Request, res: Response) => {
  const { email } = req.query;

  try {
    // Check what Edward's events look like
    const { data: edwardEvents, error: edwardError } = await supabaseAdmin
      .from('events')
      .select('organiser_id, organiser_name')
      .limit(5)

    // Check Sam's user record
    const { data: samUser, error: samError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'sam@greatevents.com')
      .single()

    // Check Edward's user record
    const { data: edwardUser, error: edwardError2 } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
      .single()

    // Check Albert's user record if email provided
    let albertUser = null
    let albertAuthDetails = null
    if (email) {
      const { data: albertUserData, error: albertError } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('first_name', `%${email}%`)
        .or(`email.ilike.%${email}%`)
        .limit(1)
        .single()

      albertUser = albertUserData

      if (albertUserData?.auth_user_id) {
        try {
          const { data: albertAuth } = await supabaseAdmin.auth.admin.getUserById(albertUserData.auth_user_id)
          albertAuthDetails = albertAuth?.user ? {
            id: albertAuth.user.id,
            email: albertAuth.user.email,
            created_at: albertAuth.user.created_at,
            email_confirmed_at: albertAuth.user.email_confirmed_at,
            last_sign_in_at: albertAuth.user.last_sign_in_at,
            user_metadata: albertAuth.user.user_metadata,
            app_metadata: albertAuth.user.app_metadata,
            aud: albertAuth.user.aud,
            role: albertAuth.user.role
          } : null
        } catch (e: any) {
          albertAuthDetails = { error: e.message }
        }
      }
    }

    // Get detailed auth user info for both
    let edwardAuthDetails = null
    let samAuthDetails = null

    try {
      const { data: edwardAuth } = await supabaseAdmin.auth.admin.getUserById('97aa0354-7991-464a-84b7-132a35e66230')
      edwardAuthDetails = edwardAuth?.user ? {
        id: edwardAuth.user.id,
        email: edwardAuth.user.email,
        created_at: edwardAuth.user.created_at,
        email_confirmed_at: edwardAuth.user.email_confirmed_at,
        last_sign_in_at: edwardAuth.user.last_sign_in_at,
        user_metadata: edwardAuth.user.user_metadata,
        app_metadata: edwardAuth.user.app_metadata,
        aud: edwardAuth.user.aud,
        role: edwardAuth.user.role
      } : null
    } catch (e: any) {
      edwardAuthDetails = { error: e.message }
    }

    try {
      const { data: samAuth } = await supabaseAdmin.auth.admin.getUserById('79f0acb3-d8c3-481f-947b-3c093e17f1fc')
      samAuthDetails = samAuth?.user ? {
        id: samAuth.user.id,
        email: samAuth.user.email,
        created_at: samAuth.user.created_at,
        email_confirmed_at: samAuth.user.email_confirmed_at,
        last_sign_in_at: samAuth.user.last_sign_in_at,
        user_metadata: samAuth.user.user_metadata,
        app_metadata: samAuth.user.app_metadata,
        aud: samAuth.user.aud,
        role: samAuth.user.role
      } : null
    } catch (e: any) {
      samAuthDetails = { error: e.message }
    }

    // Test 1: Try creating with Sam's auth_user_id
    const testEventSam = {
      name: 'Test Event Sam Auth',
      category: 'trail-running',
      organiser_id: '79f0acb3-d8c3-481f-947b-3c093e17f1fc',
      organiser_name: 'Sam Test',
      start_date: '2025-12-25',
      start_time: '10:00',
      address: 'Test Address',
      city: 'Test City',
      province: 'Test Province',
      status: 'draft'
    }

    const { data: testCreateSam, error: testCreateSamError } = await supabaseAdmin
      .from('events')
      .insert(testEventSam)
      .select()

    // Test 2: Try creating with Sam's public.users.id
    const testEventSamPublic = {
      name: 'Test Event Sam Public',
      category: 'trail-running',
      organiser_id: 'bf62cb67-4a97-433f-b252-81c68a988d58',
      organiser_name: 'Sam Test Public',
      start_date: '2025-12-26',
      start_time: '11:00',
      address: 'Test Address 2',
      city: 'Test City 2',
      province: 'Test Province 2',
      status: 'draft'
    }

    const { data: testCreateSamPublic, error: testCreateSamPublicError } = await supabaseAdmin
      .from('events')
      .insert(testEventSamPublic)
      .select()

    // Test 3: Try creating with Edward's organiser_id (should work)
    const testEventEdward = {
      name: 'Test Event Edward',
      category: 'trail-running',
      organiser_id: '97aa0354-7991-464a-84b7-132a35e66230',
      organiser_name: 'Edward Test',
      start_date: '2025-12-27',
      start_time: '12:00',
      address: 'Test Address 3',
      city: 'Test City 3',
      province: 'Test Province 3',
      status: 'draft'
    }

    const { data: testCreateEdward, error: testCreateEdwardError } = await supabaseAdmin
      .from('events')
      .insert(testEventEdward)
      .select()

    return res.json({
      sample_events: edwardEvents,
      sam_user: samUser,
      edward_user: edwardUser,
      albert_user: albertUser,
      albert_auth_details: albertAuthDetails,
      auth_user_detailed_comparison: {
        edward: edwardAuthDetails,
        sam: samAuthDetails,
        albert: albertAuthDetails,
        differences: {
          edward_id: edwardAuthDetails?.id,
          sam_id: samAuthDetails?.id,
          albert_id: albertAuthDetails?.id,
          edward_email_confirmed: edwardAuthDetails?.email_confirmed_at ? true : false,
          sam_email_confirmed: samAuthDetails?.email_confirmed_at ? true : false,
          albert_email_confirmed: albertAuthDetails?.email_confirmed_at ? true : false,
          edward_metadata: edwardAuthDetails?.user_metadata,
          sam_metadata: samAuthDetails?.user_metadata,
          albert_metadata: albertAuthDetails?.user_metadata,
          edward_has_metadata: !!edwardAuthDetails?.user_metadata,
          sam_has_metadata: !!samAuthDetails?.user_metadata,
          albert_has_metadata: !!albertAuthDetails?.user_metadata
        }
      },
      test_event_creation: {
        sam_auth_user_id: {
          success: !!testCreateSam,
          data: testCreateSam,
          error: testCreateSamError?.message
        },
        sam_public_user_id: {
          success: !!testCreateSamPublic,
          data: testCreateSamPublic,
          error: testCreateSamPublicError?.message
        },
        edward_organiser_id: {
          success: !!testCreateEdward,
          data: testCreateEdward,
          error: testCreateEdwardError?.message
        }
      },
      comparison: {
        edward_organiser_id: '97aa0354-7991-464a-84b7-132a35e66230',
        sam_auth_user_id: '79f0acb3-d8c3-481f-947b-3c093e17f1fc',
        sam_public_user_id: 'bf62cb67-4a97-433f-b252-81c68a988d58'
      },
      errors: {
        events: edwardError?.message,
        sam: samError?.message,
        edward: edwardError2?.message
      }
    })
  } catch (err) {
    console.error('Debug constraint error:', err)
    return res.json({ error: 'Failed to query constraint' })
  }
})

// Simple debug endpoint to check Albert vs Edward
router.get('/debug-albert', async (req: Request, res: Response) => {
  try {
    const albertAuthId = 'f1be0b02-1dd8-453b-ae91-1570d8a87059'
    const edwardAuthId = '97aa0354-7991-464a-84b7-132a35e66230'

    // Check both auth users exist
    const { data: albertAuth } = await supabaseAdmin.auth.admin.getUserById(albertAuthId)
    const { data: edwardAuth } = await supabaseAdmin.auth.admin.getUserById(edwardAuthId)

    // Test direct event creation
    const testEvent = {
      name: 'Debug Test',
      category: 'road-cycling',
      start_date: '2025-09-20',
      start_time: '06:00',
      organiser_name: 'Debug User',
      city: 'Test City',
      province: 'Test Province',
      license_required: false,
      temp_license_fee: 0,
      license_details: '',
      primary_image_url: 'https://example.com/image.jpg'
    }

    let edwardSuccess = false
    let albertSuccess = false
    let edwardError = null
    let albertError = null

    // Test Edward
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert({ ...testEvent, organiser_id: edwardAuthId, name: 'Edward Debug Test' })
        .select()
        .single()
      edwardSuccess = !!data
      edwardError = error?.message
    } catch (e: any) {
      edwardError = e.message
    }

    // Test Albert
    try {
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert({ ...testEvent, organiser_id: albertAuthId, name: 'Albert Debug Test' })
        .select()
        .single()
      albertSuccess = !!data
      albertError = error?.message
    } catch (e: any) {
      albertError = e.message
    }

    return res.json({
      albert: {
        exists: !!albertAuth?.user,
        metadata: albertAuth?.user?.user_metadata,
        event_creation: { success: albertSuccess, error: albertError }
      },
      edward: {
        exists: !!edwardAuth?.user,
        metadata: edwardAuth?.user?.user_metadata,
        event_creation: { success: edwardSuccess, error: edwardError }
      }
    })

  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Query database constraints and policies using direct SQL
router.get('/debug-database', async (req: Request, res: Response) => {
  try {
    // Query for foreign key constraints
    const { data: fkData, error: fkError } = await supabaseAdmin
      .from('events')
      .select('organiser_id')
      .limit(1)

    // Query for RLS policies
    const { data: rlsData, error: rlsError } = await supabaseAdmin
      .from('events')
      .select('*')
      .limit(1)

    // Query for table info
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('events')
      .select('*')
      .limit(1)

    // Check auth.users table for both users
    const { data: edwardAuth, error: edwardAuthError } = await supabaseAdmin
      .from('auth.users')
      .select('*')
      .eq('id', '97aa0354-7991-464a-84b7-132a35e66230')
      .single()

    const { data: albertAuth, error: albertAuthError } = await supabaseAdmin
      .from('auth.users')
      .select('*')
      .eq('id', 'f1be0b02-1dd8-453b-ae91-1570d8a87059')
      .single()

    // Check public.users table for both users
    const { data: edwardPublic, error: edwardPublicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
      .single()

    const { data: albertPublic, error: albertPublicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', 'f1be0b02-1dd8-453b-ae91-1570d8a87059')
      .single()

    // Check existing events
    const { data: existingEvents, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('organiser_id, organiser_name')
      .limit(5)

    return res.json({
      auth_users: {
        edward: {
          exists: !!edwardAuth,
          error: edwardAuthError?.message,
          data: edwardAuth
        },
        albert: {
          exists: !!albertAuth,
          error: albertAuthError?.message,
          data: albertAuth
        }
      },
      public_users: {
        edward: {
          exists: !!edwardPublic,
          error: edwardPublicError?.message,
          data: edwardPublic
        },
        albert: {
          exists: !!albertPublic,
          error: albertPublicError?.message,
          data: albertPublic
        }
      },
      existing_events: existingEvents,
      table_access: {
        select: { success: !!tableData, error: tableError?.message }
      }
    })

  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Verify organiser's email
// Verify organiser endpoint - DEPRECATED
router.post('/verify-organiser', async (req: Request, res: Response) => {
  return res.status(410).json({ 
    error: 'This endpoint is deprecated. Use /api/users/verify-email instead.',
    redirect: '/api/users/verify-email'
  })
})

// Check foreign key constraint definition
router.get('/check-fk', async (req: Request, res: Response) => {
  try {
    // Get the foreign key constraint definition
    const { data: fkData, error: fkError } = await supabaseAdmin
      .from('events')
      .select('organiser_id')
      .limit(1)

    // Get Edward's working events
    const { data: edwardEvents, error: edwardError } = await supabaseAdmin
      .from('events')
      .select('organiser_id, organiser_name')
      .eq('organiser_id', '97aa0354-7991-464a-84b7-132a35e66230')
      .limit(1)

    // Try to find Edward's ID in different tables
    const { data: edwardAuth, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      '97aa0354-7991-464a-84b7-132a35e66230'
    )

    const { data: edwardPublic, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
      .single()

    return res.json({
      working_event: edwardEvents?.[0],
      auth_user: edwardAuth?.user,
      public_user: edwardPublic,
      errors: {
        fk: fkError?.message,
        events: edwardError?.message,
        auth: authError?.message,
        public: publicError?.message
      }
    })

  } catch (err: any) {
    console.error('FK check error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Query RLS policies from Supabase
router.get('/debug-policies', async (req: Request, res: Response) => {
  try {
    const { table } = req.query;

    // Query for RLS policies
    const policies = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', table || 'events')

    return res.json({
      policies: policies.data,
      error: policies.error?.message
    })

  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Test endpoint to simulate Albert's event creation
router.post('/test-albert-event', async (req: Request, res: Response) => {
  try {
    // Simulate Albert's user data
    const mockUserLookup = {
      id: 'c64e3244-bcc6-45cc-a61c-7d5cf31badfc',
      auth_user_id: 'f1be0b02-1dd8-453b-ae91-1570d8a87059',
      email: 'albert@organiser.com',
      role: 'organiser',
      first_name: 'Albert',
      last_name: 'LowneHughes'
    }

    const distancesData = [{
      name: 'Test Distance',
      distance_km: 10,
      price: 100,
      min_age: 18,
      entry_limit: 100,
      start_time: '06:00',
      free_for_seniors: true,
      free_for_disability: true,
      senior_age_threshold: 65
    }]

    const testEventData = {
      name: 'Albert Test Event',
      category: 'road-cycling',
      start_date: '2025-09-20',
      end_date: null,
      start_time: '06:00',
      description: 'Test event for Albert',
      venue_name: 'Test Venue',
      address: '123 Test St',
      city: 'Test City',
      province: 'Test Province',
      license_required: false,
      temp_license_fee: 0,
      license_details: '',
      primary_image_url: 'https://example.com/image.jpg',
      organiser_id: mockUserLookup.auth_user_id,
      organiser_name: `${mockUserLookup.first_name} ${mockUserLookup.last_name}`
    }

    console.log('🧪 Testing Albert event creation...')
    console.log('🧪 User data:', mockUserLookup)
    console.log('🧪 Event data:', testEventData)
    console.log('🧪 Distances data:', distancesData)

    // 🔍 INVESTIGATE: Deep investigation of FK constraint
    console.log('🔍 Testing FK constraint with Albert...')
    console.log('🔍 User details:', {
      name: `${mockUserLookup.first_name} ${mockUserLookup.last_name}`,
      email: mockUserLookup.email,
      auth_user_id: mockUserLookup.auth_user_id,
      public_user_id: mockUserLookup.id
    })
    console.log('🔍 Edward working ID:', '97aa0354-7991-464a-84b7-132a35e66230')

    // Check if the auth user actually exists
    try {
      const { data: checkAuthUser } = await supabaseAdmin.auth.admin.getUserById(mockUserLookup.auth_user_id)
      console.log('🔍 Auth user exists check:', !!checkAuthUser?.user)
      if (checkAuthUser?.user) {
        console.log('🔍 Auth user details:', {
          id: checkAuthUser.user.id,
          email: checkAuthUser.user.email,
          metadata: checkAuthUser.user.user_metadata,
          app_metadata: checkAuthUser.user.app_metadata
        })
      }
    } catch (authCheckErr: any) {
      console.log('🔍 Auth user check failed:', authCheckErr.message)
    }

    // Try to create the event
    const event = await supabase.createEvent(testEventData)
    console.log('✅ Event created:', event.id)

    // Create distances for the event
    if (distancesData.length > 0) {
      console.log('🔍 Creating distances...')
      for (const distance of distancesData) {
        const distanceData = {
          ...distance,
          event_id: event.id
        }
        await supabase.createEventDistance(distanceData)
      }
      console.log('✅ Distances created')
    }

    return res.json({
      success: true,
      event: event,
      message: 'Albert event created successfully!'
    })

  } catch (err: any) {
    console.log('🧪 Test failed:', err.message)
    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    })
  }
})

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
    
    // 🔧 SOLUTION: Try public.users.id first, then auth_user_id as fallback
    console.log('🔍 Sam public.users.id:', userLookup.id)
    console.log('🔍 Sam auth_user_id:', userLookup.auth_user_id)
    console.log('🔍 Edward uses organiser_id:', '97aa0354-7991-464a-84b7-132a35e66230')
    
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
    console.log('  - auth_user_id (USING THIS):', userLookup.auth_user_id)
    console.log('  - public user_id:', userLookup.id)
    console.log('  - Edward uses:', '97aa0354-7991-464a-84b7-132a35e66230')
    
    // CRITICAL DEBUG: Find out what table the foreign key actually references
    try {
      const { data: existingEvents } = await supabaseAdmin
        .from('events')
        .select('organiser_id, organiser_name')
        .limit(3)
      
      console.log('🔍 Sample existing events organiser_id values:', existingEvents)
      
      // Check what Edward's organiser_id corresponds to in different tables
      if (existingEvents && existingEvents.length > 0) {
        const edwardId = existingEvents[0].organiser_id
        console.log(`🔍 Checking what table contains Edward's ID: ${edwardId}`)
        
        // Check auth.users
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(edwardId)
          console.log('✅ Edward ID found in auth.users:', !!authUser?.user)
        } catch (authErr) {
          console.log('❌ Edward ID NOT in auth.users')
        }
        
        // Check public.users
        try {
          const { data: publicUser } = await supabaseAdmin
            .from('users')
            .select('id, auth_user_id, email')
            .eq('id', edwardId)
            .single()
          console.log('✅ Edward ID found in public.users by id:', !!publicUser)
        } catch (pubErr) {
          console.log('❌ Edward ID NOT in public.users by id')
        }
        
        // Check public.users by auth_user_id
        try {
          const { data: publicUser2 } = await supabaseAdmin
            .from('users')
            .select('id, auth_user_id, email')
            .eq('auth_user_id', edwardId)
            .single()
          console.log('✅ Edward ID found in public.users by auth_user_id:', !!publicUser2)
        } catch (pubErr2) {
          console.log('❌ Edward ID NOT in public.users by auth_user_id')
        }
      }
    } catch (queryError) {
      console.log('⚠️ Could not query existing events:', queryError)
    }
    
    // ✅ Solution: Try both approaches to determine what the foreign key constraint expects

    let event = null

    // ✅ FINAL SOLUTION: Always use auth_user_id (matches Edward's working pattern)
    eventFields.organiser_id = userLookup.auth_user_id
    console.log('🔍 Using auth_user_id for organiser_id:', eventFields.organiser_id)

    try {
      event = await supabase.createEvent(eventFields)
      console.log('✅ Event created successfully:', event.id)
    } catch (createError: any) {
      console.log('❌ Event creation failed:', createError.message)

        // 🔍 INVESTIGATE: Deep investigation of FK constraint
      if (createError.message.includes('foreign key constraint')) {
        console.log('🔍 FK constraint error - investigating root cause')
        console.log('🔍 User details:', {
          name: `${userLookup.first_name} ${userLookup.last_name}`,
          email: userLookup.email,
          auth_user_id: userLookup.auth_user_id,
          public_user_id: userLookup.id
        })
        console.log('🔍 Edward working ID:', '97aa0354-7991-464a-84b7-132a35e66230')

        // Check if the auth user actually exists
        try {
          const { data: checkAuthUser } = await supabaseAdmin.auth.admin.getUserById(userLookup.auth_user_id)
          console.log('🔍 Auth user exists check:', !!checkAuthUser?.user)
          if (checkAuthUser?.user) {
            console.log('🔍 Auth user details:', {
              id: checkAuthUser.user.id,
              email: checkAuthUser.user.email,
              metadata: checkAuthUser.user.user_metadata,
              app_metadata: checkAuthUser.user.app_metadata
            })
          }
        } catch (authCheckErr: any) {
          console.log('🔍 Auth user check failed:', authCheckErr.message)
        }

        // Try to query the database directly to see if there's a schema issue
        try {
          console.log('🔍 Checking database schema...')
          const { data: schemaCheck, error: schemaError } = await supabaseAdmin
            .from('information_schema.table_constraints')
            .select('constraint_name, table_name, constraint_type')
            .eq('constraint_name', 'events_organiser_id_fkey')

          if (schemaCheck && schemaCheck.length > 0) {
            console.log('🔍 FK constraint found:', schemaCheck[0])
          } else {
            console.log('🔍 FK constraint not found in schema')
          }
        } catch (schemaErr: any) {
          console.log('🔍 Schema check failed:', schemaErr.message)
        }

        // 🔧 FIX: Update Sam's auth user metadata to include role
        console.log('🔧 Attempting to fix Sam\'s auth user metadata...')

        try {
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            userLookup.auth_user_id,
            {
              user_metadata: {
                first_name: userLookup.first_name,
                last_name: userLookup.last_name,
                role: userLookup.role,
                email_verified: true
              }
            }
          )

          if (updateError) {
            console.log('❌ Failed to update Sam\'s auth metadata:', updateError.message)
          } else {
            console.log('✅ Updated Sam\'s auth metadata successfully')
            // Try creating the event again with the updated metadata
            eventFields.organiser_id = userLookup.auth_user_id
            event = await supabase.createEvent(eventFields)
            console.log('✅ Event created successfully after metadata fix:', event.id)
            return // Success!
          }
        } catch (updateErr: any) {
          console.log('❌ Exception updating auth metadata:', updateErr.message)
        }

        throw new Error(`Foreign key constraint failed for organiser_id. User: ${userLookup.first_name} ${userLookup.last_name} (${userLookup.auth_user_id}), Edward: 97aa0354-7991-464a-84b7-132a35e66230`)
      } else {
        throw createError
      }
    }
    
    // Ensure event was created successfully
    if (!event) {
      throw new Error('Event creation failed')
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
              variation_name: variation.variation_name,
              variation_options: variation.variation_options || []
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
    console.log('🔍 Updating event with data:', updateData)
    console.log('🔍 Event ID:', id)
    console.log('🔍 Request headers:', req.headers)
    console.log('🔍 Request body type:', typeof updateData)
    console.log('🔍 Request body keys:', Object.keys(updateData))
    console.log('🔍 Date fields check:', {
      end_date: updateData.end_date,
      registration_deadline: updateData.registration_deadline,
      start_date: updateData.start_date
    })
    console.log('🔍 Server restarted with latest changes')
    
    // Extract distances and merchandise from updateData
    const { distances, merchandise, ...eventFields } = updateData
    
    // Map frontend field names to database column names
    const mappedEventFields = {
      ...eventFields,
      // Map image_url to primary_image_url for consistent frontend usage
      primary_image_url: eventFields.image_url,
      // Map venue to venue_name for proper frontend display
      venue_name: eventFields.venue,
      // Remove the old field names to avoid duplication
      image_url: undefined,
      venue: undefined
    }
    
    // Clean up undefined fields
    Object.keys(mappedEventFields).forEach(key => {
      if (mappedEventFields[key] === undefined) {
        delete mappedEventFields[key]
      }
    })
    
    // Remove fields that don't exist in database schema
    if ('country' in mappedEventFields) {
      delete (mappedEventFields as any).country
    }
    
    if ('event_type' in mappedEventFields) {
      delete (mappedEventFields as any).event_type
    }
    
    if ('gallery_images' in mappedEventFields) {
      delete (mappedEventFields as any).gallery_images
    }
    
    // Convert empty date strings to null for database compatibility
    if ('end_date' in mappedEventFields && mappedEventFields.end_date === '') {
      mappedEventFields.end_date = null
    }
    
    if ('registration_deadline' in mappedEventFields && mappedEventFields.registration_deadline === '') {
      mappedEventFields.registration_deadline = null
    }
    
    // Remove any other empty string date fields
    Object.keys(mappedEventFields).forEach(key => {
      if (mappedEventFields[key] === '' && (key.includes('date') || key.includes('deadline'))) {
        mappedEventFields[key] = null
      }
    })
    
    console.log('🔍 Final event update data:', mappedEventFields)
    
    // Build the UPDATE query dynamically
    const updateFields = Object.keys(mappedEventFields)
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      })
    }
    
    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ')
    const query = `UPDATE events SET ${setClause} WHERE id = $1`
    const values = [id, ...updateFields.map(field => mappedEventFields[field])]
    
    console.log('🔍 Update query:', query)
    console.log('🔍 Update values:', values)
    
    // Update the event
    const result = await pool.query(query, values)
    
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }
    
    console.log('✅ Event updated successfully')
    
    // Handle distances update
    if (distances !== undefined) {
      console.log('🔍 Updating distances:', distances)
      
      // Delete existing distances
      await pool.query('DELETE FROM event_distances WHERE event_id = $1', [id])
      console.log('✅ Deleted existing distances')
      
      // Insert new distances
      if (distances && distances.length > 0) {
        for (const distance of distances) {
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
    if (merchandise !== undefined) {
      console.log('🔍 Updating merchandise:', merchandise)
      
      // Delete existing merchandise and variations
      await pool.query('DELETE FROM merchandise_variations WHERE merchandise_id IN (SELECT id FROM event_merchandise WHERE event_id = $1)', [id])
      await pool.query('DELETE FROM event_merchandise WHERE event_id = $1', [id])
      console.log('✅ Deleted existing merchandise')
      
      // Insert new merchandise
      if (merchandise && merchandise.length > 0) {
        for (const item of merchandise) {
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
                variation.variation_name,
                JSON.stringify(variation.variation_options || [])
              ])
            }
          }
        }
        console.log('✅ Created new merchandise')
      }
    }
    
    // Get the updated event
    const updatedEventResult = await pool.query(`
      SELECT * FROM events WHERE id = $1
    `, [id])
    
    const updatedEvent = updatedEventResult.rows[0]
    
    res.json({
      success: true,
      data: updatedEvent
    })
  } catch (error: any) {
    console.error('Update event error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    })
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
