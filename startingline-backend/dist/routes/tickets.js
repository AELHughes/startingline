"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseService_1 = require("../services/supabaseService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const supabase = new supabaseService_1.SupabaseService();
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { event_id, distance_id, quantity = 1, participant_info } = req.body;
        const participantId = req.user.userId;
        if (!event_id || !distance_id) {
            return res.status(400).json({
                success: false,
                error: 'Event ID and distance ID are required'
            });
        }
        const event = await supabase.getEventById(event_id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        const distance = event.distances?.find((d) => d.id === distance_id);
        if (!distance) {
            return res.status(404).json({
                success: false,
                error: 'Distance not found'
            });
        }
        const ticketData = {
            event_id,
            participant_id: participantId,
            distance_id,
            quantity,
            price: distance.price * quantity,
            status: 'active'
        };
        const ticket = await supabase.createTicket(ticketData);
        res.status(201).json({
            success: true,
            data: ticket,
            message: 'Ticket created successfully'
        });
    }
    catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create ticket'
        });
    }
});
router.get('/my-tickets', auth_1.authenticateToken, async (req, res) => {
    try {
        const participantId = req.user.userId;
        const tickets = await supabase.getTicketsByParticipant(participantId);
        res.json({
            success: true,
            data: tickets
        });
    }
    catch (error) {
        console.error('Get my tickets error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get tickets'
        });
    }
});
router.get('/event/:eventId', auth_1.authenticateToken, auth_1.requireOrganiserOrAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;
        const tickets = await supabase.getTicketsByEvent(eventId);
        res.json({
            success: true,
            data: tickets
        });
    }
    catch (error) {
        console.error('Get event tickets error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get event tickets'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        res.json({
            success: false,
            error: 'Get ticket by ID not implemented yet'
        });
    }
    catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get ticket'
        });
    }
});
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role;
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        const validStatuses = ['active', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }
        const ticket = await supabase.updateTicket(id, { status });
        res.json({
            success: true,
            data: ticket,
            message: 'Ticket updated successfully'
        });
    }
    catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update ticket'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const ticket = await supabase.updateTicket(id, { status: 'cancelled' });
        res.json({
            success: true,
            message: 'Ticket cancelled successfully',
            data: ticket
        });
    }
    catch (error) {
        console.error('Cancel ticket error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to cancel ticket'
        });
    }
});
exports.default = router;
//# sourceMappingURL=tickets.js.map