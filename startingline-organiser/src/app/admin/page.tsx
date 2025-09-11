'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useAdminStats, useRecentEventsAdmin } from '@/hooks/use-events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Activity,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: recentEvents = [], isLoading: recentEventsLoading } = useRecentEventsAdmin(3)

  // Dashboard stats from real data
  const statsCards = [
    {
      title: 'Total Events',
      value: statsLoading ? '...' : (stats?.totalEvents || 0).toString(),
      description: 'All events in system',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Events',
      value: statsLoading ? '...' : (stats?.activeEvents || 0).toString(),
      description: 'Published events',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Approval',
      value: statsLoading ? '...' : (stats?.pendingEvents || 0).toString(),
      description: 'Events awaiting review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Organisers',
      value: statsLoading ? '...' : (stats?.totalOrganisers || 0).toString(),
      description: 'Registered organisers',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4" />
      case 'pending_approval':
        return <Clock className="h-4 w-4" />
      case 'draft':
        return <FileText className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}
          </h2>
          <p className="text-gray-600">
            Here's an overview of the Starting Line platform activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Events
              </CardTitle>
              <CardDescription>Latest event submissions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.name}</h4>
                        <p className="text-sm text-gray-600">by {event.organiser_name}</p>
                        <p className="text-xs text-gray-500">{event.time_ago}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(event.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(event.status)}
                            <span>{event.status.replace('_', ' ')}</span>
                          </div>
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent events found</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/events')}
                >
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/admin/events?status=pending_approval')}
                >
                  <AlertCircle className="h-5 w-5 mr-3 text-yellow-600" />
                  <div className="text-left">
                    <div className="font-medium">Review Pending Events</div>
                    <div className="text-sm text-gray-500">
                      {statsLoading ? 'Loading...' : `${stats?.pendingEvents || 0} events awaiting approval`}
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/admin/events')}
                >
                  <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Manage All Events</div>
                    <div className="text-sm text-gray-500">View and manage all events</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="h-5 w-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">User Management</div>
                    <div className="text-sm text-gray-500">Manage organisers and participants</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/admin/reports')}
                >
                  <TrendingUp className="h-5 w-5 mr-3 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium">Platform Reports</div>
                    <div className="text-sm text-gray-500">Analytics and insights</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => router.push('/admin/create-admin')}
                >
                  <Settings className="h-5 w-5 mr-3 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Create Admin User</div>
                    <div className="text-sm text-gray-500">Add new administrator</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
