'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useMyEvents } from '@/hooks/use-events'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Stats from '@/components/dashboard/stats'
import RecentEvents from '@/components/dashboard/recent-events'
import { Plus, Calendar, MapPin, Users, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: events = [], isLoading } = useMyEvents()

  const handleCreateEvent = () => {
    router.push('/dashboard/events/create')
  }

  // Calculate stats
  const totalEvents = events.length
  const publishedEvents = events.filter(event => event.status === 'published').length
  const draftEvents = events.filter(event => event.status === 'draft').length
  const pendingEvents = events.filter(event => event.status === 'pending_approval').length

  const stats = [
    {
      title: 'Total Events',
      value: totalEvents,
      description: 'All your events',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Published',
      value: publishedEvents,
      description: 'Live events',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Draft',
      value: draftEvents,
      description: 'Work in progress',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Pending',
      value: pendingEvents,
      description: 'Awaiting approval',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.first_name || 'Organiser'}!</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || 'Organiser'}!</p>
        </div>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={handleCreateEvent}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Create Event</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/events')}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Manage Events</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/profile')}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span>Profile Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEvents events={events.slice(0, 5)} />
        <Stats />
      </div>

      {/* All Events Summary */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>Overview of all your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {event.primary_image_url || event.image_url ? (
                      <img
                        src={event.primary_image_url || event.image_url}
                        alt={event.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(event.start_date).toLocaleDateString()}
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={
                        event.status === 'published' ? 'default' :
                        event.status === 'pending_approval' ? 'secondary' :
                        'outline'
                      }
                    >
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              
              {events.length > 3 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/events')}
                  >
                    View All Events ({events.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first event. It only takes a few minutes!
            </p>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
