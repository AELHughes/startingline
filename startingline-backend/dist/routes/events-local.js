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
            const distancesResult = await database_1.pool.query('SELECT * FROM event_distances WHERE event_id = $1 ORDER BY distance_km ASC', [event.id]);
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
        const distancesResult = await database_1.pool.query('SELECT * FROM event_distances WHERE event_id = $1 ORDER BY distance_km ASC', [event.id]);
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
            database_1.pool.query('SELECT * FROM event_distances WHERE event_id = $1 ORDER BY distance_km ASC', [event.id]),
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
router.post('/', auth_local_1.authenticateToken, auth_local_1.requireOrganiser, async (req, res) => {
    const client = await database_1.pool.connect();
    try {
        await client.query('BEGIN');
        const eventData = req.body;
        const organiserId = req.localUser.userId;
        console.log('🔍 Creating event:', eventData.name, 'for organizer:', organiserId);
        const baseSlug = eventData.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-');
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
        const eventResult = await client.query(eventQuery, eventValues);
        const newEvent = eventResult.rows[0];
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
                    error: 'You can only update your own events'
                });
            }
        }
        const updateFields = [];
        const updateValues = [];
        let paramCounter = 1;
        const allowedFields = [
            'name', 'category', 'start_date', 'start_time', 'venue_name',
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
        console.log('✅ Updated event:', result.rows[0].name);
        res.json({
            success: true,
            data: result.rows[0],
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
exports.default = router;
//# sourceMappingURL=events-local.js.map