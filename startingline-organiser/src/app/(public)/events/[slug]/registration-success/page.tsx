'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { participantRegistrationApi, type Order } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Download, Mail, MessageSquare, Calendar, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function RegistrationSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setError('No order ID provided')
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      // First, try to get order data from sessionStorage (from registration)
      const storedOrderData = sessionStorage.getItem('registration_order')
      if (storedOrderData) {
        const { order, tickets } = JSON.parse(storedOrderData)
        setOrder({
          ...order,
          tickets: tickets
        })
        setLoading(false)
        return
      }
      
      // If no stored data, check if user is authenticated and fetch from API
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setError('No order data available')
        setLoading(false)
        return
      }
      
      const response = await participantRegistrationApi.getMyOrders()
      
      if (response.success && response.data) {
        const foundOrder = response.data.find(o => o.id === orderId)
        if (foundOrder) {
          setOrder(foundOrder)
        } else {
          setError('Order not found')
        }
      } else {
        setError(response.error || 'Failed to load order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const downloadTicket = async (ticketId: string) => {
    try {
      // This would generate and download the PDF ticket
      // For now, we'll just show a message
      alert('Ticket download functionality will be implemented with PDF generation')
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
          <Link href={`/events/${slug}`}>
            <Button>Back to Event</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-lg text-gray-600">
            Your registration for <strong>{order.event_name}</strong> has been confirmed and processed successfully.
          </p>
        </div>

        {/* Order Summary */}
        {order && order.id && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Order #{order.id.slice(-8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{order.start_date !== 'TBD' ? new Date(order.start_date).toLocaleDateString() : 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{order.start_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{order.city}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-semibold">R{order.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Participants:</span>
                      <span>{order.tickets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets */}
        {order.tickets && order.tickets.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
              <CardDescription>
                Download individual tickets or view them in your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{ticket.participant_name}</h4>
                      <p className="text-sm text-gray-600">{ticket.participant_email}</p>
                      <p className="text-sm text-gray-500">Ticket #{ticket.ticket_number}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                      <span className="font-semibold">R{ticket.amount}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTicket(ticket.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
              <CardDescription>
                Your tickets will be sent to your email address shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tickets on the way!</h3>
                <p className="text-gray-600">
                  Your tickets will be sent to your email address within the next few minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Here's what happens after your successful registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Email Confirmation</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with your tickets attached as PDFs.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">SMS/WhatsApp Notification</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive SMS and WhatsApp messages with your ticket details and QR codes.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Event Reminders</h4>
                  <p className="text-sm text-gray-600">
                    We'll send you reminders closer to the event date with important information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/participant-dashboard">
            <Button variant="outline">
              View in Dashboard
            </Button>
          </Link>
          <Link href={`/events/${slug}`}>
            <Button variant="outline">
              Back to Event
            </Button>
          </Link>
          <Link href="/events">
            <Button>
              Browse More Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
