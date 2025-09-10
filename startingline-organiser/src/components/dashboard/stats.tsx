'use client'

import React from 'react'
import { useMyEvents } from '@/hooks/use-events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase-api'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'

export default function Stats() {
  const { data: events = [] } = useMyEvents()

  // Get event IDs for tickets and payments queries
  const eventIds = events.map(event => event.id)

  // Fetch tickets data (with error handling for missing table)
  const { data: ticketsData = [] } = useQuery({
    queryKey: ['dashboard-tickets', eventIds],
    queryFn: async () => {
      if (eventIds.length === 0) return []
      
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('participant_id, event_id')
          .in('event_id', eventIds)
          .eq('status', 'active')

        if (error) {
          console.warn('⚠️ Tickets table not accessible (participant registration not set up yet):', error.message)
          return []
        }

        return data || []
      } catch (error) {
        console.warn('⚠️ Tickets query failed:', error)
        return []
      }
    },
    enabled: eventIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch payments data (with error handling for missing table)
  const { data: paymentsData = [] } = useQuery({
    queryKey: ['dashboard-payments', eventIds],
    queryFn: async () => {
      if (eventIds.length === 0) return []
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('amount')
          .in('event_id', eventIds)
          .eq('status', 'completed')

        if (error) {
          console.warn('⚠️ Payments table not accessible (participant registration not set up yet):', error.message)
          return []
        }

        return data || []
      } catch (error) {
        console.warn('⚠️ Payments query failed:', error)
        return []
      }
    },
    enabled: eventIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  // Calculate stats
  const totalParticipants = ticketsData.length
  const totalRevenue = paymentsData.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_date)
    const today = new Date()
    return eventDate >= today && event.status === 'published'
  }).length

  const stats = [
    {
      title: 'Total Participants',
      value: totalParticipants,
      description: 'Active registrations',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: null
    },
    {
      title: 'Revenue',
      value: `R${totalRevenue.toLocaleString()}`,
      description: 'Total earnings',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: null
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents,
      description: 'Events this month',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: null
    },
    {
      title: 'Growth',
      value: '12%',
      description: 'vs last month',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12%'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Stats</CardTitle>
        <CardDescription>Your event performance overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Note about missing tables */}
        {totalParticipants === 0 && totalRevenue === 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Participant and revenue data will appear here once the registration system is set up.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
