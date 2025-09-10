import express, { Request, Response } from 'express'
import { SupabaseService } from '../services/supabaseService'
import { authenticateToken, requireOrganiserOrAdmin } from '../middleware/auth'

const router = express.Router()
const supabase = new SupabaseService()

/**
 * Create ticket(s) for event registration
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { event_id, distance_id, quantity = 1, participant_info } = req.body
    const participantId = req.user!.userId

    if (!event_id || !distance_id) {
      return res.status(400).json({
        success: false,
        error: 'Event ID and distance ID are required'
      })
    }

    // Get event and distance details for pricing
    const event = await supabase.getEventById(event_id)
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      })
    }

    const distance = event.distances?.find((d: any) => d.id === distance_id)
    if (!distance) {
      return res.status(404).json({
        success: false,
        error: 'Distance not found'
      })
    }

    // Create ticket
    const ticketData = {
      event_id,
      participant_id: participantId,
      distance_id,
      quantity,
      price: distance.price * quantity,
      status: 'active'
    }

    const ticket = await supabase.createTicket(ticketData)

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    })

  } catch (error: any) {
    console.error('Create ticket error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create ticket'
    })
  }
})

/**
 * Get tickets for current user
 */
router.get('/my-tickets', authenticateToken, async (req: Request, res: Response) => {
  try {
    const participantId = req.user!.userId
    const tickets = await supabase.getTicketsByParticipant(participantId)

    res.json({
      success: true,
      data: tickets
    })
  } catch (error: any) {
    console.error('Get my tickets error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get tickets'
    })
  }
})

/**
 * Get tickets for specific event (Organiser/Admin only)
 */
router.get('/event/:eventId', authenticateToken, requireOrganiserOrAdmin, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params
    const tickets = await supabase.getTicketsByEvent(eventId)

    res.json({
      success: true,
      data: tickets
    })
  } catch (error: any) {
    console.error('Get event tickets error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get event tickets'
    })
  }
})

/**
 * Get specific ticket by ID
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId
    const userRole = req.user!.role

    // Implementation would need to be added to SupabaseService
    res.json({
      success: false,
      error: 'Get ticket by ID not implemented yet'
    })
  } catch (error: any) {
    console.error('Get ticket error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ticket'
    })
  }
})

/**
 * Update ticket status
 */
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user!.userId
    const userRole = req.user!.role

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      })
    }

    const validStatuses = ['active', 'cancelled', 'refunded']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const ticket = await supabase.updateTicket(id, { status })

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully'
    })

  } catch (error: any) {
    console.error('Update ticket error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update ticket'
    })
  }
})

/**
 * Cancel ticket
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.userId

    // Update ticket status to cancelled instead of deleting
    const ticket = await supabase.updateTicket(id, { status: 'cancelled' })

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: ticket
    })

  } catch (error: any) {
    console.error('Cancel ticket error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel ticket'
    })
  }
})

export default router
