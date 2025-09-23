"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../lib/database");
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
router.get('/', auth_local_1.optionalAuth, async (req, res) => {
    try {
        console.log('🔍 Fetching all published events...');
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
    `;
        const result = await database_1.pool.query(query);
        const eventsWithDetails = await Promise.all(result.rows.map(async (event) => {
            const distancesResult = await database_1.pool.query(`
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
        `, [event.id]);
            const merchandiseResult = await database_1.pool.query('SELECT * FROM event_merchandise WHERE event_id = $1', [event.id]);
            return {
                ...event,
                distances: distancesResult.rows,
                merchandise: merchandiseResult.rows
            };
        }));
        console.log(`✅ Found ${eventsWithDetails.length} published events`);
        res.json({
            success: true,
            data: eventsWithDetails
        });
    }
    catch (error) {
        console.error('❌ Get events error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});
router.get('/slug/:slug', auth_local_1.optionalAuth, async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('🔍 Fetching event by slug:', slug);
        const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        u.email AS organiser_email
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      WHERE e.slug = $1
    `;
        const result = await database_1.pool.query(query, [slug]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const event = result.rows[0];
        const distancesResult = await database_1.pool.query(`
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
    `, [event.id]);
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
    `;
        const merchandiseResult = await database_1.pool.query(merchandiseQuery, [event.id]);
        const eventWithDetails = {
            ...event,
            distances: distancesResult.rows,
            merchandise: merchandiseResult.rows
        };
        console.log(`✅ Found event: ${event.name}`);
        res.json({
            success: true,
            data: eventWithDetails
        });
    }
    catch (error) {
        console.error('❌ Get event by slug error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event'
        });
    }
});
router.get('/my', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, async (req, res) => {
    try {
        console.log('🔍 Fetching events for organizer:', req.localUser?.userId);
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
    `;
        const result = await database_1.pool.query(query, [req.localUser.userId]);
        console.log(`✅ Found ${result.rows.length} events for organizer`);
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('❌ Get my events error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch your events'
        });
    }
});
router.get('/:id', auth_local_1.optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Fetching event by ID:', id);
        const query = `
      SELECT 
        e.*,
        u.first_name || ' ' || u.last_name AS organiser_name,
        u.email AS organiser_email
      FROM events e
      JOIN users u ON e.organiser_id = u.id
      WHERE e.id = $1
    `;
        const result = await database_1.pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const event = result.rows[0];
        const [distancesResult, merchandiseResult] = await Promise.all([
            database_1.pool.query(`
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
            database_1.pool.query(`
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
        ]);
        const eventWithDetails = {
            ...event,
            distances: distancesResult.rows,
            merchandise: merchandiseResult.rows
        };
        console.log(`✅ Found event: ${event.name}`);
        res.json({
            success: true,
            data: eventWithDetails
        });
    }
    catch (error) {
        console.error('❌ Get event by ID error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch event'
        });
    }
});
router.post('/', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, async (req, res) => {
    console.log('🚀 EVENT CREATION ENDPOINT REACHED - POST /');
    console.log('🔍 req.localUser after middleware:', req.localUser);
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        const eventData = req.body;
        const organiserId = req.localUser.userId;
        console.log('🔍 Creating event:', eventData.name, 'for organizer:', organiserId);
        console.log('🔍 req.localUser:', req.localUser);
        console.log('🔍 organiserId type:', typeof organiserId);
        console.log('🔍 organiserId value:', organiserId);
        if (!eventData.name || !eventData.category || !eventData.start_date) {
            console.log('❌ Validation failed - missing required fields');
            console.log('🔍 eventData.name:', eventData.name);
            console.log('🔍 eventData.category:', eventData.category);
            console.log('🔍 eventData.start_date:', eventData.start_date);
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, category, and start_date are required'
            });
        }
        console.log('✅ Validation passed - all required fields present');
        if (eventData.merchandise && eventData.merchandise.length > 0) {
            console.log('🔍 Validating merchandise variations...');
            for (const merch of eventData.merchandise) {
                if (merch.variations && merch.variations.length > 0) {
                    for (const variation of merch.variations) {
                        if (!variation.variation_name || !variation.variation_options) {
                            console.log('❌ Invalid merchandise variation:', variation);
                            return res.status(400).json({
                                success: false,
                                error: `Invalid merchandise variation for ${merch.name}: variation_name and variation_options are required`
                            });
                        }
                    }
                }
            }
            console.log('✅ Merchandise variations validation passed');
        }
        const baseSlug = eventData.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-');
        console.log('🔍 Generated slug:', baseSlug + '-' + Date.now());
        const eventQuery = `
      INSERT INTO events (
        name, slug, category, organiser_id, start_date, start_time,
        venue_name, address, city, province, country, latitude, longitude,
        license_required, temp_license_fee, license_details,
        primary_image_url, gallery_images, description, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `;
        console.log('🔍 Event query prepared');
        console.log('🔍 About to prepare event values...');
        const eventValues = [
            eventData.name,
            baseSlug + '-' + Date.now(),
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
        ];
        console.log('🔍 Event values prepared:', eventValues.length, 'values');
        console.log('🔍 Executing event creation query:');
        console.log('  - Query:', eventQuery);
        console.log('  - Values:', eventValues);
        console.log('  - organiserId:', organiserId);
        console.log('  - organiserId type:', typeof organiserId);
        let newEvent;
        try {
            console.log('🔍 About to execute event creation query...');
            const eventResult = await client.query(eventQuery, eventValues);
            newEvent = eventResult.rows[0];
            console.log('✅ Event created successfully:', newEvent.id);
            console.log('✅ Event details:', newEvent);
            if (!newEvent || !newEvent.id) {
                throw new Error('Event creation failed - no event ID returned');
            }
        }
        catch (eventError) {
            console.error('❌ Event creation failed:', eventError.message);
            console.error('❌ Event creation error details:', eventError);
            console.error('❌ Event creation error code:', eventError.code);
            console.error('❌ Event creation error detail:', eventError.detail);
            throw eventError;
        }
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
                ]);
            }
        }
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
                ]);
                if (merch.variations && merch.variations.length > 0) {
                    for (const variation of merch.variations) {
                        if (!variation.variation_name || !variation.variation_options) {
                            console.warn('⚠️ Skipping invalid variation:', variation);
                            continue;
                        }
                        await client.query(`
              INSERT INTO merchandise_variations (merchandise_id, variation_name, variation_options)
              VALUES ($1, $2, $3)
            `, [
                            merchResult.rows[0].id,
                            variation.variation_name,
                            JSON.stringify(variation.variation_options)
                        ]);
                    }
                }
            }
        }
        if (newEvent && newEvent.id) {
            console.log('🔍 Creating audit trail entry:');
            console.log('  - event_id:', newEvent.id);
            console.log('  - organiserId:', organiserId);
            console.log('  - organiserId type:', typeof organiserId);
            try {
                const auditQuery = `
          INSERT INTO event_audit_trail (event_id, action_type, performed_by, performed_by_role, message, metadata)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
                const auditValues = [
                    newEvent.id,
                    'created',
                    organiserId,
                    'organiser',
                    'Event created as draft',
                    null
                ];
                console.log('🔍 Executing audit trail query within transaction...');
                const auditResult = await client.query(auditQuery, auditValues);
                console.log('✅ Audit trail entry created successfully:', auditResult.rows[0]);
                if (eventData.status === 'pending_approval') {
                    console.log('🔍 Event submitted for approval - updating status and creating audit trail...');
                    await client.query('UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2', ['pending_approval', newEvent.id]);
                    const statusChangeAuditValues = [
                        newEvent.id,
                        'status_changed',
                        organiserId,
                        'organiser',
                        'Event submitted for approval',
                        JSON.stringify({ from_status: 'draft', to_status: 'pending_approval' })
                    ];
                    const statusChangeAuditResult = await client.query(auditQuery, statusChangeAuditValues);
                    console.log('✅ Status change audit trail entry created successfully:', statusChangeAuditResult.rows[0]);
                    console.log('🔔 Creating admin notifications for new event submission...');
                    try {
                        const adminResult = await client.query(`
              SELECT u.id, u.email 
              FROM users u
              INNER JOIN admin_users au ON u.email = au.email
              WHERE au.is_active = true
            `);
                        console.log(`📧 Found ${adminResult.rows.length} active admin users`);
                        for (const admin of adminResult.rows) {
                            await (0, database_1.createNotification)(admin.id, 'status_change', 'New Event Submitted for Approval', `Event "${newEvent.name}" has been submitted for approval and requires review.`, `/admin/events/${newEvent.id}`, {
                                event_id: newEvent.id,
                                organiser_id: organiserId,
                                event_name: newEvent.name
                            });
                            console.log(`✅ Notification created for admin: ${admin.email}`);
                        }
                    }
                    catch (notificationError) {
                        console.error('❌ Failed to create admin notifications:', notificationError.message);
                    }
                    newEvent.status = 'pending_approval';
                }
            }
            catch (auditError) {
                console.error('❌ Audit trail creation failed:', auditError.message);
                console.error('❌ Audit trail error details:', auditError);
                throw auditError;
            }
        }
        else {
            console.error('❌ Cannot create audit trail - event was not created successfully');
            throw new Error('Event creation failed - cannot create audit trail');
        }
        await client.query('COMMIT');
        console.log('✅ Created event:', newEvent.name, 'with ID:', newEvent.id);
        res.status(201).json({
            success: true,
            data: newEvent,
            message: 'Event created successfully'
        });
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Create event error:', error.message);
        console.error('❌ Full error object:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create event'
        });
    }
    finally {
        client.release();
    }
});
router.put('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.localUser.userId;
        const userRole = req.localUser.role;
        console.log('🔍 Updating event:', id, 'by user:', userId);
        const originalEventResult = await database_1.pool.query('SELECT organiser_id, status FROM events WHERE id = $1', [id]);
        if (originalEventResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const originalEvent = originalEventResult.rows[0];
        if (userRole !== 'admin' && originalEvent.organiser_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own events'
            });
        }
        const updateFields = [];
        const updateValues = [];
        let paramCounter = 1;
        const allowedFields = [
            'name', 'category', 'event_type', 'start_date', 'end_date', 'start_time', 'registration_deadline', 'venue_name',
            'address', 'city', 'province', 'country', 'latitude', 'longitude',
            'license_required', 'temp_license_fee', 'license_details',
            'primary_image_url', 'gallery_images', 'description', 'status'
        ];
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateFields.push(`${field} = $${paramCounter}`);
                updateValues.push(field === 'gallery_images' ? JSON.stringify(updates[field]) : updates[field]);
                paramCounter++;
            }
        }
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }
        updateValues.push(id);
        const updateQuery = `
      UPDATE events 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCounter}
      RETURNING *
    `;
        const result = await database_1.pool.query(updateQuery, updateValues);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const updatedEvent = result.rows[0];
        if (updates.status && updates.status !== originalEvent.status) {
            let actionType = '';
            let message = '';
            let notificationTitle = '';
            let notificationMessage = '';
            if (updates.status === 'pending_approval') {
                actionType = 'submitted_for_approval';
                message = 'Event submitted for admin approval';
                notificationTitle = 'Event Submitted for Approval';
                notificationMessage = `Your event "${updatedEvent.name}" has been submitted for approval and is now being reviewed by administrators.`;
            }
            else if (updates.status === 'published') {
                actionType = 'published';
                message = 'Event published and made live';
                notificationTitle = 'Event Published';
                notificationMessage = `Great news! Your event "${updatedEvent.name}" has been approved and is now live for participants to register.`;
            }
            else if (updates.status === 'cancelled') {
                actionType = 'cancelled';
                message = 'Event cancelled';
                notificationTitle = 'Event Cancelled';
                notificationMessage = `Your event "${updatedEvent.name}" has been cancelled.`;
            }
            if (actionType) {
                await (0, database_1.createAuditTrailEntry)(id, actionType, userId, userRole === 'admin' ? 'admin' : 'organiser', message);
                if (userRole === 'admin' && originalEvent.organiser_id !== userId) {
                    await (0, database_1.createNotification)(originalEvent.organiser_id, 'status_change', notificationTitle, notificationMessage, `/dashboard/events/${id}/history`, {
                        event_id: id,
                        previous_status: originalEvent.status,
                        new_status: updates.status
                    });
                }
                if (updates.status === 'pending_approval' && userRole === 'organiser') {
                    const adminResult = await database_1.pool.query(`
            SELECT u.id, u.email 
            FROM users u
            INNER JOIN admin_users au ON u.email = au.email
            WHERE au.is_active = true
          `);
                    for (const admin of adminResult.rows) {
                        await (0, database_1.createNotification)(admin.id, 'status_change', 'New Event Submitted for Approval', `Event "${updatedEvent.name}" has been submitted for approval and requires review.`, `/admin/events/${id}`, {
                            event_id: id,
                            organiser_id: originalEvent.organiser_id,
                            event_name: updatedEvent.name
                        });
                    }
                }
            }
        }
        if (originalEvent.status === 'pending_approval' && userRole === 'organiser' && !updates.status) {
            console.log('🔍 Event in pending_approval was edited by organiser - creating audit trail and admin notifications...');
            const editedFields = Object.keys(updates).filter(field => field !== 'status');
            const editMessage = `Event content updated by organiser. Fields changed: ${editedFields.join(', ')}`;
            await (0, database_1.createAuditTrailEntry)(id, 'content_edited', userId, 'organiser', editMessage, { edited_fields: editedFields });
            try {
                const adminResult = await database_1.pool.query(`
          SELECT u.id, u.email 
          FROM users u
          INNER JOIN admin_users au ON u.email = au.email
          WHERE au.is_active = true
        `);
                console.log(`📧 Found ${adminResult.rows.length} active admin users for edit notification`);
                for (const admin of adminResult.rows) {
                    await (0, database_1.createNotification)(admin.id, 'content_edit', 'Event Under Review Was Edited', `Event "${updatedEvent.name}" has been edited by the organiser while under review. Fields changed: ${editedFields.join(', ')}`, `/admin/events/${id}`, {
                        event_id: id,
                        organiser_id: originalEvent.organiser_id,
                        event_name: updatedEvent.name,
                        edited_fields: editedFields
                    });
                    console.log(`✅ Edit notification created for admin: ${admin.email}`);
                }
            }
            catch (notificationError) {
                console.error('❌ Failed to create edit notifications:', notificationError.message);
            }
        }
        console.log('✅ Updated event:', updatedEvent.name);
        res.json({
            success: true,
            data: updatedEvent,
            message: 'Event updated successfully'
        });
    }
    catch (error) {
        console.error('❌ Update event error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update event'
        });
    }
});
router.delete('/:id', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const userRole = req.localUser.role;
        console.log('🔍 Deleting event:', id, 'by user:', userId);
        if (userRole !== 'admin') {
            const ownerCheck = await database_1.pool.query('SELECT organiser_id, name FROM events WHERE id = $1', [id]);
            if (ownerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }
            if (ownerCheck.rows[0].organiser_id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only delete your own events'
                });
            }
        }
        const result = await database_1.pool.query('DELETE FROM events WHERE id = $1 RETURNING name', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        console.log('✅ Deleted event:', result.rows[0].name);
        res.json({
            success: true,
            message: `Event "${result.rows[0].name}" deleted successfully`
        });
    }
    catch (error) {
        console.error('❌ Delete event error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to delete event'
        });
    }
});
router.get('/admin/all', auth_local_1.authenticateToken, auth_local_1.requireOrganiserOrAdmin, async (req, res) => {
    try {
        console.log('🔍 Admin fetching all events...');
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
    `;
        const result = await database_1.pool.query(query);
        console.log(`✅ Admin found ${result.rows.length} events`);
        res.json({
            success: true,
            data: result.rows
        });
    }
    catch (error) {
        console.error('❌ Admin get all events error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});
router.post('/:id/audit-trail', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { action_type, message, metadata } = req.body;
        const userId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            const ownerCheck = await database_1.pool.query('SELECT organiser_id FROM events WHERE id = $1', [id]);
            if (ownerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }
            if (ownerCheck.rows[0].organiser_id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only create audit entries for your own events'
                });
            }
        }
        const entry = await (0, database_1.createAuditTrailEntry)(id, action_type, userId, userRole === 'admin' ? 'admin' : 'organiser', message, metadata);
        if (action_type === 'change_requested' && userRole === 'organiser') {
            console.log('🔔 Creating admin notifications for change request...');
            try {
                const eventResult = await database_1.pool.query('SELECT name, organiser_id FROM events WHERE id = $1', [id]);
                if (eventResult.rows.length > 0) {
                    const event = eventResult.rows[0];
                    const adminResult = await database_1.pool.query(`
            SELECT u.id, u.email 
            FROM users u
            INNER JOIN admin_users au ON u.email = au.email
            WHERE au.is_active = true
          `);
                    console.log(`📧 Found ${adminResult.rows.length} active admin users for change request notification`);
                    for (const admin of adminResult.rows) {
                        await (0, database_1.createNotification)(admin.id, 'change_request', 'Event Change Request', `Organiser has requested changes to event "${event.name}". Request: ${message}`, `/admin/events/${id}`, {
                            event_id: id,
                            organiser_id: event.organiser_id,
                            event_name: event.name,
                            change_request: message
                        });
                        console.log(`✅ Change request notification created for admin: ${admin.email}`);
                    }
                }
            }
            catch (notificationError) {
                console.error('❌ Failed to create change request notifications:', notificationError.message);
            }
        }
        res.status(201).json({
            success: true,
            data: entry,
            message: 'Audit trail entry created successfully'
        });
    }
    catch (error) {
        console.error('❌ Create audit trail entry error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create audit trail entry'
        });
    }
});
router.get('/:id/audit-trail', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            const ownerCheck = await database_1.pool.query('SELECT organiser_id FROM events WHERE id = $1', [id]);
            if (ownerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }
            if (ownerCheck.rows[0].organiser_id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only view audit trail for your own events'
                });
            }
        }
        const auditTrail = await (0, database_1.getEventAuditTrail)(id);
        res.json({
            success: true,
            data: auditTrail,
            message: 'Audit trail retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get audit trail error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve audit trail'
        });
    }
});
router.get('/admin/all', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can access this endpoint'
            });
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
    `;
        const result = await database_1.pool.query(query);
        console.log('✅ Admin retrieved', result.rows.length, 'events');
        res.json({
            success: true,
            data: result.rows,
            message: 'All events retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Admin get all events error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch events'
        });
    }
});
router.put('/admin/:id/status', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const adminId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can update event status'
            });
        }
        if (!['draft', 'pending_approval', 'published', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }
        const eventResult = await database_1.pool.query('SELECT * FROM events WHERE id = $1', [id]);
        if (eventResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const event = eventResult.rows[0];
        const previousStatus = event.status;
        const updateResult = await database_1.pool.query('UPDATE events SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);
        const updatedEvent = updateResult.rows[0];
        let auditMessage = `Admin updated event status from ${previousStatus} to ${status}`;
        if (adminNote) {
            auditMessage += `. Note: ${adminNote}`;
        }
        await (0, database_1.createAuditTrailEntry)(id, 'admin_updated', adminId, 'admin', auditMessage);
        let notificationTitle = '';
        let notificationMessage = '';
        switch (status) {
            case 'published':
                notificationTitle = 'Event Approved & Published!';
                notificationMessage = `Great news! Your event "${event.name}" has been approved and is now live for participants to register.`;
                break;
            case 'cancelled':
                notificationTitle = 'Event Rejected';
                notificationMessage = `Your event "${event.name}" has been rejected.${adminNote ? ` Admin note: ${adminNote}` : ''}`;
                break;
            case 'pending_approval':
                notificationTitle = 'Event Returned for Review';
                notificationMessage = `Your event "${event.name}" requires additional information.${adminNote ? ` Admin note: ${adminNote}` : ''}`;
                break;
        }
        if (notificationTitle) {
            await (0, database_1.createNotification)(event.organiser_id, 'status_change', notificationTitle, notificationMessage, `/dashboard/events/${id}/history`, {
                event_id: id,
                previous_status: previousStatus,
                new_status: status,
                admin_note: adminNote
            });
        }
        if (adminNote) {
            await database_1.pool.query(`INSERT INTO messages (event_id, sender_id, recipient_id, subject, body)
         VALUES ($1, $2, $3, $4, $5)`, [
                id,
                adminId,
                event.organiser_id,
                `Event ${status === 'published' ? 'Approved' : status === 'cancelled' ? 'Rejected' : 'Update Required'}: ${event.name}`,
                adminNote
            ]);
            await (0, database_1.createNotification)(event.organiser_id, 'message', 'New Message from Admin', `You have received a message regarding your event "${event.name}".`, '/dashboard/messages', { event_id: id });
        }
        res.json({
            success: true,
            data: updatedEvent,
            message: 'Event status updated successfully'
        });
    }
    catch (error) {
        console.error('❌ Admin update event status error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update event status'
        });
    }
});
router.get('/admin/stats', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can access this endpoint'
            });
        }
        const eventStatsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'published' THEN 1 END) as active_events,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_events,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_events,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_events
      FROM events
    `;
        const organiserStatsQuery = `
      SELECT COUNT(*) as total_organisers
      FROM users
      WHERE role = 'organiser'
    `;
        const [eventStats, organiserStats] = await Promise.all([
            database_1.pool.query(eventStatsQuery),
            database_1.pool.query(organiserStatsQuery)
        ]);
        const stats = {
            totalEvents: parseInt(eventStats.rows[0].total_events),
            activeEvents: parseInt(eventStats.rows[0].active_events),
            pendingEvents: parseInt(eventStats.rows[0].pending_events),
            draftEvents: parseInt(eventStats.rows[0].draft_events),
            cancelledEvents: parseInt(eventStats.rows[0].cancelled_events),
            totalOrganisers: parseInt(organiserStats.rows[0].total_organisers)
        };
        console.log('✅ Admin stats retrieved:', stats);
        res.json({
            success: true,
            data: stats,
            message: 'Admin statistics retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Admin get stats error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch admin statistics'
        });
    }
});
router.get('/admin/recent', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can access this endpoint'
            });
        }
        const limit = parseInt(req.query.limit) || 5;
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
    `;
        const result = await database_1.pool.query(query, [limit]);
        const recentEvents = result.rows.map(event => ({
            ...event,
            organiser_name: `${event.organiser_first_name} ${event.organiser_last_name}`,
            time_ago: getTimeAgo(event.updated_at)
        }));
        console.log('✅ Admin recent events retrieved:', recentEvents.length);
        res.json({
            success: true,
            data: recentEvents,
            message: 'Recent events retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Admin get recent events error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent events'
        });
    }
});
router.put('/admin/:id/section', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { section, data } = req.body;
        const adminId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can update event sections'
            });
        }
        console.log(`🔧 Admin updating event ${id} section: ${section}`);
        const validSections = ['overview', 'location', 'distances', 'merchandise'];
        if (!validSections.includes(section)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid section. Must be one of: overview, location, distances, merchandise'
            });
        }
        const eventCheck = await database_1.pool.query('SELECT id, name, status, organiser_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const event = eventCheck.rows[0];
        let updateQuery = '';
        let updateValues = [];
        let updateFields = [];
        switch (section) {
            case 'overview':
                if (data.name) {
                    updateFields.push('name = $' + (updateValues.length + 1));
                    updateValues.push(data.name);
                }
                if (data.category) {
                    updateFields.push('category = $' + (updateValues.length + 1));
                    updateValues.push(data.category);
                }
                if (data.event_type) {
                    updateFields.push('event_type = $' + (updateValues.length + 1));
                    updateValues.push(data.event_type);
                }
                if (data.description !== undefined) {
                    updateFields.push('description = $' + (updateValues.length + 1));
                    updateValues.push(data.description);
                }
                if (data.start_date) {
                    updateFields.push('start_date = $' + (updateValues.length + 1));
                    updateValues.push(data.start_date);
                }
                if (data.end_date) {
                    updateFields.push('end_date = $' + (updateValues.length + 1));
                    updateValues.push(data.end_date);
                }
                if (data.start_time) {
                    updateFields.push('start_time = $' + (updateValues.length + 1));
                    updateValues.push(data.start_time);
                }
                if (data.registration_deadline) {
                    updateFields.push('registration_deadline = $' + (updateValues.length + 1));
                    updateValues.push(data.registration_deadline);
                }
                if (data.max_participants !== undefined) {
                    updateFields.push('max_participants = $' + (updateValues.length + 1));
                    updateValues.push(data.max_participants);
                }
                if (data.entry_fee !== undefined) {
                    updateFields.push('entry_fee = $' + (updateValues.length + 1));
                    updateValues.push(data.entry_fee);
                }
                if (data.license_required !== undefined) {
                    updateFields.push('license_required = $' + (updateValues.length + 1));
                    updateValues.push(data.license_required);
                }
                if (data.temp_license_fee !== undefined) {
                    updateFields.push('temp_license_fee = $' + (updateValues.length + 1));
                    updateValues.push(data.temp_license_fee);
                }
                if (data.license_details) {
                    updateFields.push('license_details = $' + (updateValues.length + 1));
                    updateValues.push(data.license_details);
                }
                break;
            case 'location':
                if (data.venue_name) {
                    updateFields.push('venue_name = $' + (updateValues.length + 1));
                    updateValues.push(data.venue_name);
                }
                if (data.address) {
                    updateFields.push('address = $' + (updateValues.length + 1));
                    updateValues.push(data.address);
                }
                if (data.city) {
                    updateFields.push('city = $' + (updateValues.length + 1));
                    updateValues.push(data.city);
                }
                if (data.province) {
                    updateFields.push('province = $' + (updateValues.length + 1));
                    updateValues.push(data.province);
                }
                break;
            case 'distances':
                if (data.distances && Array.isArray(data.distances) && data.distances.length > 0) {
                    await database_1.pool.query('DELETE FROM event_distances WHERE event_id = $1', [id]);
                    for (const distance of data.distances) {
                        await database_1.pool.query('INSERT INTO event_distances (event_id, name, distance_km, price, min_age, entry_limit, start_time, free_for_seniors, free_for_disability, senior_age_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [
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
                        ]);
                    }
                }
                break;
            case 'merchandise':
                if (data.merchandise && Array.isArray(data.merchandise)) {
                    await database_1.pool.query('DELETE FROM merchandise_variations WHERE merchandise_id IN (SELECT id FROM event_merchandise WHERE event_id = $1)', [id]);
                    await database_1.pool.query('DELETE FROM event_merchandise WHERE event_id = $1', [id]);
                    for (const item of data.merchandise) {
                        const merchResult = await database_1.pool.query('INSERT INTO event_merchandise (event_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING id', [id, item.name, item.description, item.base_price || item.price]);
                        const merchandiseId = merchResult.rows[0].id;
                        if (item.variations && Array.isArray(item.variations)) {
                            for (const variation of item.variations) {
                                let variationOptions = variation.variation_options;
                                if (typeof variationOptions === 'string') {
                                    try {
                                        variationOptions = JSON.parse(variationOptions);
                                    }
                                    catch (e) {
                                        variationOptions = [variationOptions];
                                    }
                                }
                                else if (!Array.isArray(variationOptions)) {
                                    variationOptions = [];
                                }
                                await database_1.pool.query('INSERT INTO merchandise_variations (merchandise_id, variation_name, variation_options) VALUES ($1, $2, $3)', [merchandiseId, variation.variation_name, JSON.stringify(variationOptions)]);
                            }
                        }
                    }
                }
                break;
        }
        if (updateFields.length > 0) {
            updateQuery = `UPDATE events SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${updateValues.length + 1}`;
            updateValues.push(id);
            await database_1.pool.query(updateQuery, updateValues);
        }
        await (0, database_1.createAuditTrailEntry)(id, 'admin_edit_section', adminId, 'admin', `Admin updated ${section} section`, {
            section,
            changes: data
        });
        if (event.status === 'published') {
            try {
                await (0, database_1.createNotification)(event.organiser_id, 'admin_edit', 'Event Updated by Administrator', `An administrator has updated the ${section} section of your published event "${event.name}".`, `/dashboard/events/${id}/history`, {
                    event_id: id,
                    admin_id: adminId,
                    section: section,
                    event_name: event.name
                });
                console.log(`✅ Notification created for organiser about admin edit to published event`);
            }
            catch (notificationError) {
                console.error('❌ Failed to create organiser notification for admin edit:', notificationError.message);
            }
        }
        console.log(`✅ Admin successfully updated event ${id} ${section} section`);
        res.json({
            success: true,
            message: `${section} section updated successfully`,
            data: {
                eventId: id,
                section,
                updatedFields: updateFields
            }
        });
    }
    catch (error) {
        console.error('❌ Admin update event section error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update event section'
        });
    }
});
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'Just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
router.get('/:id/admin-comments', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            const ownerCheck = await database_1.pool.query('SELECT organiser_id FROM events WHERE id = $1', [id]);
            if (ownerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found'
                });
            }
            if (ownerCheck.rows[0].organiser_id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only view admin comments for your own events'
                });
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
    `;
        const result = await database_1.pool.query(query, [id]);
        res.json({
            success: true,
            data: result.rows,
            message: 'Admin comments retrieved successfully'
        });
    }
    catch (error) {
        console.error('❌ Get admin comments error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve admin comments'
        });
    }
});
router.post('/:id/admin-comments', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { section, comment } = req.body;
        const adminId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can create admin comments'
            });
        }
        if (!section || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: section, comment'
            });
        }
        const eventCheck = await database_1.pool.query('SELECT id, name, organiser_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const event = eventCheck.rows[0];
        const query = `
      INSERT INTO admin_comments (event_id, admin_id, section, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await database_1.pool.query(query, [id, adminId, section, comment]);
        const newComment = result.rows[0];
        await (0, database_1.createNotification)(event.organiser_id, 'admin_comment', 'New Admin Comment', `You have received a new comment from an administrator on your event "${event.name}" (${section} section).`, `/dashboard/events/${id}/comments`, {
            event_id: id,
            comment_id: newComment.id,
            section: section
        });
        res.status(201).json({
            success: true,
            data: newComment,
            message: 'Admin comment created successfully'
        });
    }
    catch (error) {
        console.error('❌ Create admin comment error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to create admin comment'
        });
    }
});
router.put('/admin-comments/:commentId', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { comment, status } = req.body;
        const adminId = req.localUser.userId;
        const userRole = req.localUser.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Only administrators can update admin comments'
            });
        }
        const updateFields = [];
        const updateValues = [];
        let paramCounter = 1;
        if (comment !== undefined) {
            updateFields.push(`comment = $${paramCounter}`);
            updateValues.push(comment);
            paramCounter++;
        }
        if (status !== undefined) {
            updateFields.push(`status = $${paramCounter}`);
            updateValues.push(status);
            paramCounter++;
        }
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(commentId);
        const query = `
      UPDATE admin_comments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter} AND admin_id = $${paramCounter + 1}
      RETURNING *
    `;
        updateValues.push(adminId);
        const result = await database_1.pool.query(query, updateValues);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Admin comment not found or you do not have permission to update it'
            });
        }
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Admin comment updated successfully'
        });
    }
    catch (error) {
        console.error('❌ Update admin comment error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to update admin comment'
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
//# sourceMappingURL=events-local.js.map