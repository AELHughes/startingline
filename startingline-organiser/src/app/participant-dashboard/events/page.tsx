'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { participantRegistrationApi, type Order } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, Download, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function MyEventsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (user) {
      if (user.role !== 'participant') {
        router.push('/dashboard')
      } else {
        fetchOrders()
      }
    } else {
      setLoading(false)
    }
  }, [user, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await participantRegistrationApi.getMyOrders()
      
      if (response.success && response.data) {
        setOrders(response.data)
      } else {
        setError(response.error || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = async (ticketId: string) => {
    try {
      // Get ticket details
      const response = await participantRegistrationApi.getTicket(ticketId)
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get ticket details')
      }

      // Import the PDF generator dynamically
      const { generateTicketPDF } = await import('@/lib/pdfGenerator')
      
      // Generate and download the PDF
      await generateTicketPDF(response.data)
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket. Please try again.')
    }
  }

  const upcomingOrders = orders.filter(order => new Date(order.start_date) >= new Date())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your event registrations.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Events</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchOrders}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Your upcoming event registrations and tickets</p>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {upcomingOrders.length > 0 ? (
          upcomingOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{order.event_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Order #{order.id.slice(-8).toUpperCase()} • {order.tickets.length} participant{order.tickets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(order.start_date), 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{order.start_time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{order.city}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="font-semibold">R{order.total_amount}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Tickets:</h4>
                    {order.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="text-sm font-medium">{ticket.participant_name}</span>
                          <p className="text-xs text-gray-600">#{ticket.ticket_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">R{ticket.amount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTicket(ticket.id)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
            <p className="text-gray-600 mb-4">You don't have any upcoming event registrations.</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}