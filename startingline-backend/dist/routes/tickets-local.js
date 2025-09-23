"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../lib/database");
const auth_local_1 = require("../middleware/auth-local");
const router = express_1.default.Router();
router.get('/:ticketId/pdf-data', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.localUser.userId;
        const query = `
      SELECT 
        t.id as ticket_id,
        t.ticket_number,
        t.participant_first_name,
        t.participant_last_name,
        t.participant_email,
        t.participant_mobile,
        t.participant_date_of_birth,
        t.amount,
        t.status,
        t.created_at,
        ed.name as distance_name,
        ed.price as distance_price,
        e.name as event_name,
        e.start_date,
        e.start_time,
        e.city,
        e.address,
        e.venue_name,
        u.first_name || ' ' || u.last_name as organizer_name,
        u.organizer_logo_url
      FROM tickets t
      JOIN event_distances ed ON t.distance_id = ed.id
      JOIN events e ON t.event_id = e.id
      JOIN users u ON e.organiser_id = u.id
      WHERE t.id = $1
    `;
        const result = await database_1.pool.query(query, [ticketId]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ticket not found'
            });
        }
        const ticket = result.rows[0];
        const hasAccess = ticket.participant_email === req.localUser.email ||
            ticket.organizer_name.includes(req.localUser.email) ||
            req.localUser.role === 'admin';
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        const ticketData = {
            ticketNumber: ticket.ticket_number,
            participantName: `${ticket.participant_first_name} ${ticket.participant_last_name}`,
            participantEmail: ticket.participant_email,
            participantMobile: ticket.participant_mobile,
            eventName: ticket.event_name,
            eventDate: ticket.start_date,
            eventTime: ticket.start_time,
            eventLocation: ticket.venue_name ? `${ticket.venue_name}, ${ticket.city}` : ticket.city,
            distanceName: ticket.distance_name,
            distancePrice: parseFloat(ticket.distance_price),
            organizerName: ticket.organizer_name,
            organizerLogo: ticket.organizer_logo_url ? `${process.env.BACKEND_URL || 'http://localhost:5001'}${ticket.organizer_logo_url}` : undefined
        };
        res.json({
            success: true,
            data: ticketData
        });
    }
    catch (error) {
        console.error('Get ticket PDF data error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get ticket data'
        });
    }
});
router.get('/my-tickets', auth_local_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.localUser.userId;
        const userEmail = req.localUser.email;
        const query = `
      SELECT 
        t.id as ticket_id,
        t.ticket_number,
        t.participant_first_name,
        t.participant_last_name,
        t.participant_email,
        t.amount,
        t.status,
        t.created_at,
        ed.name as distance_name,
        ed.price as distance_price,
        e.name as event_name,
        e.start_date,
        e.start_time,
        e.city,
        e.venue_name,
        u.first_name || ' ' || u.last_name as organizer_name
      FROM tickets t
      JOIN event_distances ed ON t.distance_id = ed.id
      JOIN events e ON t.event_id = e.id
      JOIN users u ON e.organiser_id = u.id
      WHERE t.participant_email = $1
      ORDER BY t.created_at DESC
    `;
        const result = await database_1.pool.query(query, [userEmail]);
        const tickets = result.rows.map(ticket => ({
            id: ticket.ticket_id,
            ticketNumber: ticket.ticket_number,
            participantName: `${ticket.participant_first_name} ${ticket.participant_last_name}`,
            participantEmail: ticket.participant_email,
            amount: parseFloat(ticket.amount),
            status: ticket.status,
            createdAt: ticket.created_at,
            distanceName: ticket.distance_name,
            distancePrice: parseFloat(ticket.distance_price),
            eventName: ticket.event_name,
            eventDate: ticket.start_date,
            eventTime: ticket.start_time,
            eventLocation: ticket.venue_name ? `${ticket.venue_name}, ${ticket.city}` : ticket.city,
            organizerName: ticket.organizer_name
        }));
        res.json({
            success: true,
            data: tickets
        });
    }
    catch (error) {
        console.error('Get user tickets error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get user tickets'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tickets-local.js.map