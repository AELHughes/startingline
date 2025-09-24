'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMyEvents } from '@/hooks/use-events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Package, AlertCircle, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MerchandiseOrder {
  participant_name: string
  participant_email: string
  event_name: string
  merchandise_name: string
  quantity: number
  variations: { [key: string]: string }
  status: 'pending' | 'picked' | 'delivered'
  order_date: string
}

export default function MerchandisePage() {
  const router = useRouter()
  const { data: events, isLoading, error } = useMyEvents()
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [merchandiseOrders, setMerchandiseOrders] = useState<MerchandiseOrder[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedEvent) {
      fetchMerchandiseOrders(selectedEvent)
    }
  }, [selectedEvent])

  const fetchMerchandiseOrders = async (eventId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/events/${eventId}/merchandise-orders`)
      const data = await response.json()
      
      if (data.success) {
        setMerchandiseOrders(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch merchandise orders')
      }
    } catch (error) {
      console.error('Error fetching merchandise orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'picked' | 'delivered') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/merchandise-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh orders
        fetchMerchandiseOrders(selectedEvent)
      } else {
        throw new Error(data.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const downloadPickList = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/events/${selectedEvent}/merchandise-picklist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download pick list')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `merchandise-picklist-${selectedEvent}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading pick list:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchandise Orders</h1>
        <p className="text-gray-600">Track and manage merchandise orders for your events.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to view its merchandise orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger>
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map(event => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <Button onClick={downloadPickList}>
              <Download className="h-4 w-4 mr-2" />
              Download Pick List
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : merchandiseOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders Found</h3>
                  <p className="text-gray-600">This event has no merchandise orders yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {merchandiseOrders.map((order, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{order.participant_name}</h3>
                        <p className="text-sm text-gray-600">{order.participant_email}</p>
                        <p className="text-sm text-gray-600">{order.event_name}</p>
                      </div>
                      <Badge variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'picked' ? 'secondary' :
                        'outline'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{order.merchandise_name}</span>
                        <span>x{order.quantity}</span>
                      </div>
                      {Object.entries(order.variations).length > 0 && (
                        <div className="text-sm text-gray-600">
                          {Object.entries(order.variations).map(([key, value]) => (
                            <span key={key} className="mr-2">{key}: {value}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      {order.status !== 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'picked')}
                        >
                          Mark as Picked
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
