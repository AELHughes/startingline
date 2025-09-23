"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseService_1 = require("../services/supabaseService");
const auth_local_1 = require("../middleware/auth-local");
const supabase_1 = require("../lib/supabase");
const database_1 = require("../lib/database");
const router = express_1.default.Router();
router.get('/debug-constraint', async (req, res) => {
    const { email } = req.query;
    try {
        const { data: edwardEvents, error: edwardError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('organiser_id, organiser_name')
            .limit(5);
        const { data: samUser, error: samError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', 'sam@greatevents.com')
            .single();
        const { data: edwardUser, error: edwardError2 } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
            .single();
        let albertUser = null;
        let albertAuthDetails = null;
        if (email) {
            const { data: albertUserData, error: albertError } = await supabase_1.supabaseAdmin
                .from('users')
                .select('*')
                .ilike('first_name', `%${email}%`)
                .or(`email.ilike.%${email}%`)
                .limit(1)
                .single();
            albertUser = albertUserData;
            if (albertUserData?.auth_user_id) {
                try {
                    const { data: albertAuth } = await supabase_1.supabaseAdmin.auth.admin.getUserById(albertUserData.auth_user_id);
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
                    } : null;
                }
                catch (e) {
                    albertAuthDetails = { error: e.message };
                }
            }
        }
        let edwardAuthDetails = null;
        let samAuthDetails = null;
        try {
            const { data: edwardAuth } = await supabase_1.supabaseAdmin.auth.admin.getUserById('97aa0354-7991-464a-84b7-132a35e66230');
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
            } : null;
        }
        catch (e) {
            edwardAuthDetails = { error: e.message };
        }
        try {
            const { data: samAuth } = await supabase_1.supabaseAdmin.auth.admin.getUserById('79f0acb3-d8c3-481f-947b-3c093e17f1fc');
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
            } : null;
        }
        catch (e) {
            samAuthDetails = { error: e.message };
        }
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
        };
        const { data: testCreateSam, error: testCreateSamError } = await supabase_1.supabaseAdmin
            .from('events')
            .insert(testEventSam)
            .select();
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
        };
        const { data: testCreateSamPublic, error: testCreateSamPublicError } = await supabase_1.supabaseAdmin
            .from('events')
            .insert(testEventSamPublic)
            .select();
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
        };
        const { data: testCreateEdward, error: testCreateEdwardError } = await supabase_1.supabaseAdmin
            .from('events')
            .insert(testEventEdward)
            .select();
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
        });
    }
    catch (err) {
        console.error('Debug constraint error:', err);
        return res.json({ error: 'Failed to query constraint' });
    }
});
router.get('/debug-albert', async (req, res) => {
    try {
        const albertAuthId = 'f1be0b02-1dd8-453b-ae91-1570d8a87059';
        const edwardAuthId = '97aa0354-7991-464a-84b7-132a35e66230';
        const { data: albertAuth } = await supabase_1.supabaseAdmin.auth.admin.getUserById(albertAuthId);
        const { data: edwardAuth } = await supabase_1.supabaseAdmin.auth.admin.getUserById(edwardAuthId);
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
        };
        let edwardSuccess = false;
        let albertSuccess = false;
        let edwardError = null;
        let albertError = null;
        try {
            const { data, error } = await supabase_1.supabaseAdmin
                .from('events')
                .insert({ ...testEvent, organiser_id: edwardAuthId, name: 'Edward Debug Test' })
                .select()
                .single();
            edwardSuccess = !!data;
            edwardError = error?.message;
        }
        catch (e) {
            edwardError = e.message;
        }
        try {
            const { data, error } = await supabase_1.supabaseAdmin
                .from('events')
                .insert({ ...testEvent, organiser_id: albertAuthId, name: 'Albert Debug Test' })
                .select()
                .single();
            albertSuccess = !!data;
            albertError = error?.message;
        }
        catch (e) {
            albertError = e.message;
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
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.get('/debug-database', async (req, res) => {
    try {
        const { data: fkData, error: fkError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('organiser_id')
            .limit(1);
        const { data: rlsData, error: rlsError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('*')
            .limit(1);
        const { data: tableData, error: tableError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('*')
            .limit(1);
        const { data: edwardAuth, error: edwardAuthError } = await supabase_1.supabaseAdmin
            .from('auth.users')
            .select('*')
            .eq('id', '97aa0354-7991-464a-84b7-132a35e66230')
            .single();
        const { data: albertAuth, error: albertAuthError } = await supabase_1.supabaseAdmin
            .from('auth.users')
            .select('*')
            .eq('id', 'f1be0b02-1dd8-453b-ae91-1570d8a87059')
            .single();
        const { data: edwardPublic, error: edwardPublicError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
            .single();
        const { data: albertPublic, error: albertPublicError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_user_id', 'f1be0b02-1dd8-453b-ae91-1570d8a87059')
            .single();
        const { data: existingEvents, error: eventsError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('organiser_id, organiser_name')
            .limit(5);
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
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.post('/verify-organiser', async (req, res) => {
    return res.status(410).json({
        error: 'This endpoint is deprecated. Use /api/users/verify-email instead.',
        redirect: '/api/users/verify-email'
    });
});
router.get('/check-fk', async (req, res) => {
    try {
        const { data: fkData, error: fkError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('organiser_id')
            .limit(1);
        const { data: edwardEvents, error: edwardError } = await supabase_1.supabaseAdmin
            .from('events')
            .select('organiser_id, organiser_name')
            .eq('organiser_id', '97aa0354-7991-464a-84b7-132a35e66230')
            .limit(1);
        const { data: edwardAuth, error: authError } = await supabase_1.supabaseAdmin.auth.admin.getUserById('97aa0354-7991-464a-84b7-132a35e66230');
        const { data: edwardPublic, error: publicError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('auth_user_id', '97aa0354-7991-464a-84b7-132a35e66230')
            .single();
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
        });
    }
    catch (err) {
        console.error('FK check error:', err);
        return res.status(500).json({ error: err.message });
    }
});
router.get('/debug-policies', async (req, res) => {
    try {
        const { table } = req.query;
        const policies = await supabase_1.supabaseAdmin
            .from('pg_policies')
            .select('*')
            .eq('tablename', table || 'events');
        return res.json({
            policies: policies.data,
            error: policies.error?.message
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
router.post('/test-albert-event', async (req, res) => {
    try {
        const mockUserLookup = {
            id: 'c64e3244-bcc6-45cc-a61c-7d5cf31badfc',
            auth_user_id: 'f1be0b02-1dd8-453b-ae91-1570d8a87059',
            email: 'albert@organiser.com',
            role: 'organiser',
            first_name: 'Albert',
            last_name: 'LowneHughes'
        };
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
            }];
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
        };
        console.log('🧪 Testing Albert event creation...');
        console.log('🧪 User data:', mockUserLookup);
        console.log('🧪 Event data:', testEventData);
        console.log('🧪 Distances data:', distancesData);
        console.log('🔍 Testing FK constraint with Albert...');
        console.log('🔍 User details:', {
            name: `${mockUserLookup.first_name} ${mockUserLookup.last_name}`,
            email: mockUserLookup.email,
            auth_user_id: mockUserLookup.auth_user_id,
            public_user_id: mockUserLookup.id
        });
        console.log('🔍 Edward working ID:', '97aa0354-7991-464a-84b7-132a35e66230');
        try {
            const { data: checkAuthUser } = await supabase_1.supabaseAdmin.auth.admin.getUserById(mockUserLookup.auth_user_id);
            console.log('🔍 Auth user exists check:', !!checkAuthUser?.user);
            if (checkAuthUser?.user) {
                console.log('🔍 Auth user details:', {
                    id: checkAuthUser.user.id,
                    email: checkAuthUser.user.email,
                    metadata: checkAuthUser.user.user_metadata,
                    app_metadata: checkAuthUser.user.app_metadata
                });
            }
        }
        catch (authCheckErr) {
            console.log('🔍 Auth user check failed:', authCheckErr.message);
        }
        const event = await supabase.createEvent(testEventData);
        console.log('✅ Event created:', event.id);
        if (distancesData.length > 0) {
            console.log('🔍 Creating distances...');
            for (const distance of distancesData) {
                const distanceData = {
                    ...distance,
                    event_id: event.id
                };
                await supabase.createEventDistance(distanceData);
            }
            console.log('✅ Distances created');
        }
        return res.json({
            success: true,
            event: event,
            message: 'Albert event created successfully!'
        });
    }
    catch (err) {
        console.log('🧪 Test failed:', err.message);
        return res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack
        });
    }
});
const supabase = new supabaseService_1.SupabaseService();
router.get('/', async (req, res) => {
    try {
        const events = await supabase.getAllEvents();
        res.json({
            success: true,
            data: events
        });
    }
    catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch events'
        });
    }
});
router.get('/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('🔍 Getting event by slug:', slug);
        const event = await supabase.getEventBySlug(slug);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Get event by slug error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch event'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await supabase.getEventById(id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        res.json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch event'
        });
    }
});
router.post('/', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const eventData = req.body;
        console.log('🔍 Creating event with data:', eventData);
        const { distances, merchandise, ...rawEventFields } = eventData;
        const eventFields = {
            ...rawEventFields,
            primary_image_url: rawEventFields.image_url,
            venue_name: rawEventFields.venue,
            image_url: undefined,
            venue: undefined
        };
        Object.keys(eventFields).forEach(key => {
            if (eventFields[key] === undefined) {
                delete eventFields[key];
            }
        });
        const publicUserId = req.user.userId;
        if ('country' in eventFields) {
            delete eventFields.country;
            console.log('🔍 Removed country field from eventFields');
        }
        if ('event_type' in eventFields) {
            delete eventFields.event_type;
            console.log('🔍 Removed event_type field from eventFields');
        }
        if ('gallery_images' in eventFields) {
            delete eventFields.gallery_images;
            console.log('🔍 Removed gallery_images field from eventFields');
        }
        if ('end_date' in eventFields && eventFields.end_date === '') {
            eventFields.end_date = null;
            console.log('🔍 Converted empty end_date to null');
        }
        console.log('🔍 Public User ID from middleware:', publicUserId);
        console.log('🔍 Full user object from middleware:', req.user);
        const { data: userLookup, error: lookupError } = await supabase_1.supabaseAdmin
            .from('users')
            .select('id, auth_user_id, email, role, first_name, last_name')
            .eq('id', publicUserId)
            .single();
        if (lookupError || !userLookup) {
            console.log('❌ User lookup failed:', lookupError);
            throw new Error('User not found in database');
        }
        console.log('🔍 User lookup result:', userLookup);
        console.log('🔍 Available user data:', {
            public_id: userLookup.id,
            auth_user_id: userLookup.auth_user_id,
            email: userLookup.email
        });
        console.log('🔍 Sam public.users.id:', userLookup.id);
        console.log('🔍 Sam auth_user_id:', userLookup.auth_user_id);
        console.log('🔍 Edward uses organiser_id:', '97aa0354-7991-464a-84b7-132a35e66230');
        eventFields.organiser_name = `${userLookup.first_name} ${userLookup.last_name}`.trim();
        console.log('🔍 Setting organiser_name to:', eventFields.organiser_name);
        const generateSlug = (text) => {
            return text
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        };
        eventFields.slug = generateSlug(eventFields.name || '');
        console.log('🔍 Generated slug:', eventFields.slug);
        console.log('🔍 Final event data being sent to database:', eventFields);
        console.log('🔍 Available IDs for organiser_id:');
        console.log('  - auth_user_id (USING THIS):', userLookup.auth_user_id);
        console.log('  - public user_id:', userLookup.id);
        console.log('  - Edward uses:', '97aa0354-7991-464a-84b7-132a35e66230');
        try {
            const { data: existingEvents } = await supabase_1.supabaseAdmin
                .from('events')
                .select('organiser_id, organiser_name')
                .limit(3);
            console.log('🔍 Sample existing events organiser_id values:', existingEvents);
            if (existingEvents && existingEvents.length > 0) {
                const edwardId = existingEvents[0].organiser_id;
                console.log(`🔍 Checking what table contains Edward's ID: ${edwardId}`);
                try {
                    const { data: authUser } = await supabase_1.supabaseAdmin.auth.admin.getUserById(edwardId);
                    console.log('✅ Edward ID found in auth.users:', !!authUser?.user);
                }
                catch (authErr) {
                    console.log('❌ Edward ID NOT in auth.users');
                }
                try {
                    const { data: publicUser } = await supabase_1.supabaseAdmin
                        .from('users')
                        .select('id, auth_user_id, email')
                        .eq('id', edwardId)
                        .single();
                    console.log('✅ Edward ID found in public.users by id:', !!publicUser);
                }
                catch (pubErr) {
                    console.log('❌ Edward ID NOT in public.users by id');
                }
                try {
                    const { data: publicUser2 } = await supabase_1.supabaseAdmin
                        .from('users')
                        .select('id, auth_user_id, email')
                        .eq('auth_user_id', edwardId)
                        .single();
                    console.log('✅ Edward ID found in public.users by auth_user_id:', !!publicUser2);
                }
                catch (pubErr2) {
                    console.log('❌ Edward ID NOT in public.users by auth_user_id');
                }
            }
        }
        catch (queryError) {
            console.log('⚠️ Could not query existing events:', queryError);
        }
        let event = null;
        eventFields.organiser_id = userLookup.auth_user_id;
        console.log('🔍 Using auth_user_id for organiser_id:', eventFields.organiser_id);
        try {
            event = await supabase.createEvent(eventFields);
            console.log('✅ Event created successfully:', event.id);
        }
        catch (createError) {
            console.log('❌ Event creation failed:', createError.message);
            if (createError.message.includes('foreign key constraint')) {
                console.log('🔍 FK constraint error - investigating root cause');
                console.log('🔍 User details:', {
                    name: `${userLookup.first_name} ${userLookup.last_name}`,
                    email: userLookup.email,
                    auth_user_id: userLookup.auth_user_id,
                    public_user_id: userLookup.id
                });
                console.log('🔍 Edward working ID:', '97aa0354-7991-464a-84b7-132a35e66230');
                try {
                    const { data: checkAuthUser } = await supabase_1.supabaseAdmin.auth.admin.getUserById(userLookup.auth_user_id);
                    console.log('🔍 Auth user exists check:', !!checkAuthUser?.user);
                    if (checkAuthUser?.user) {
                        console.log('🔍 Auth user details:', {
                            id: checkAuthUser.user.id,
                            email: checkAuthUser.user.email,
                            metadata: checkAuthUser.user.user_metadata,
                            app_metadata: checkAuthUser.user.app_metadata
                        });
                    }
                }
                catch (authCheckErr) {
                    console.log('🔍 Auth user check failed:', authCheckErr.message);
                }
                try {
                    console.log('🔍 Checking database schema...');
                    const { data: schemaCheck, error: schemaError } = await supabase_1.supabaseAdmin
                        .from('information_schema.table_constraints')
                        .select('constraint_name, table_name, constraint_type')
                        .eq('constraint_name', 'events_organiser_id_fkey');
                    if (schemaCheck && schemaCheck.length > 0) {
                        console.log('🔍 FK constraint found:', schemaCheck[0]);
                    }
                    else {
                        console.log('🔍 FK constraint not found in schema');
                    }
                }
                catch (schemaErr) {
                    console.log('🔍 Schema check failed:', schemaErr.message);
                }
                console.log('🔧 Attempting to fix Sam\'s auth user metadata...');
                try {
                    const { data: updateData, error: updateError } = await supabase_1.supabaseAdmin.auth.admin.updateUserById(userLookup.auth_user_id, {
                        user_metadata: {
                            first_name: userLookup.first_name,
                            last_name: userLookup.last_name,
                            role: userLookup.role,
                            email_verified: true
                        }
                    });
                    if (updateError) {
                        console.log('❌ Failed to update Sam\'s auth metadata:', updateError.message);
                    }
                    else {
                        console.log('✅ Updated Sam\'s auth metadata successfully');
                        eventFields.organiser_id = userLookup.auth_user_id;
                        event = await supabase.createEvent(eventFields);
                        console.log('✅ Event created successfully after metadata fix:', event.id);
                        return;
                    }
                }
                catch (updateErr) {
                    console.log('❌ Exception updating auth metadata:', updateErr.message);
                }
                throw new Error(`Foreign key constraint failed for organiser_id. User: ${userLookup.first_name} ${userLookup.last_name} (${userLookup.auth_user_id}), Edward: 97aa0354-7991-464a-84b7-132a35e66230`);
            }
            else {
                throw createError;
            }
        }
        if (!event) {
            throw new Error('Event creation failed');
        }
        if (distances && distances.length > 0) {
            console.log('🔍 Creating distances:', distances);
            for (const distance of distances) {
                await supabase.createEventDistance({
                    ...distance,
                    event_id: event.id
                });
            }
            console.log('✅ Event distances created');
        }
        if (merchandise && merchandise.length > 0) {
            console.log('🔍 Creating merchandise:', merchandise);
            for (const item of merchandise) {
                const { variations, ...merchandiseData } = item;
                console.log('🔍 Creating merchandise item:', merchandiseData);
                const createdMerchandise = await supabase.createMerchandise({
                    ...merchandiseData,
                    event_id: event.id
                });
                console.log('✅ Merchandise item created:', createdMerchandise.id);
                if (variations && variations.length > 0) {
                    console.log('🔍 Creating merchandise variations:', variations);
                    for (const variation of variations) {
                        await supabase.createMerchandiseVariation({
                            merchandise_id: createdMerchandise.id,
                            variation_name: variation.name,
                            variation_options: variation.options || []
                        });
                    }
                    console.log('✅ Merchandise variations created');
                }
            }
            console.log('✅ Event merchandise created');
        }
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                ...event,
                distances_created: distances?.length || 0,
                merchandise_created: merchandise?.length || 0
            }
        });
    }
    catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create event'
        });
    }
});
router.put('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const event = await supabase.updateEvent(id, updateData);
        res.json({
            success: true,
            data: event
        });
    }
    catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update event'
        });
    }
});
router.delete('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await supabase.deleteEvent(id);
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete event'
        });
    }
});
router.get('/:eventId/participant-analytics', auth_local_1.authenticateToken, auth_local_1.requireOrganiserOrAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.localUser.userId;
        const eventCheck = await database_1.pool.query(`
      SELECT e.id, e.name, e.start_date, e.start_time, e.city,
             u.role, u.email
      FROM events e
      LEFT JOIN users u ON e.organiser_id = u.id
      WHERE e.id = $1 AND (e.organiser_id = $2 OR u.role = 'admin')
    `, [eventId, userId]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found or access denied'
            });
        }
        const event = eventCheck.rows[0];
        const distancesResult = await database_1.pool.query(`
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
    `, [eventId]);
        const totalParticipantsResult = await database_1.pool.query(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_participants,
        COUNT(CASE WHEN participant_disabled = true THEN 1 END) as disabled_participants
      FROM tickets 
      WHERE event_id = $1
    `, [eventId]);
        const participantsResult = await database_1.pool.query(`
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
    `, [eventId]);
        const totalEntryLimit = distancesResult.rows.reduce((sum, distance) => {
            return sum + (distance.entry_limit || 0);
        }, 0);
        const totalParticipants = totalParticipantsResult.rows[0];
        const totalActiveParticipants = totalParticipants.active_participants || 0;
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
        };
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('Get participant analytics error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get participant analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map