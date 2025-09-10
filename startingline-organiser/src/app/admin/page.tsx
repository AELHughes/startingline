'use client'

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
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
  LogOut,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/admin/login')
      } else if (user.role !== 'admin' && user.role !== 'super_admin') {
        // Redirect non-admin users to their appropriate dashboard
        if (user.role === 'organiser') {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null
  }

  // Mock data for dashboard stats
  const stats = [
    {
      title: 'Total Events',
      value: '42',
      description: 'All events in system',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Events',
      value: '28',
      description: 'Published events',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Approval',
      value: '8',
      description: 'Events awaiting review',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Organisers',
      value: '156',
      description: 'Registered organisers',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const recentEvents = [
    {
      id: '1',
      name: 'Cape Town Cycle Tour 2024',
      organiser: 'Cycle Tour Trust',
      status: 'pending_approval',
      submittedAt: '2 hours ago'
    },
    {
      id: '2', 
      name: 'Comrades Marathon',
      organiser: 'Comrades Marathon Association',
      status: 'published',
      submittedAt: '1 day ago'
    },
    {
      id: '3',
      name: 'Two Oceans Marathon',
      organiser: 'Two Oceans Marathon',
      status: 'published', 
      submittedAt: '2 days ago'
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                <p className="text-sm text-gray-500">Starting Line Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.first_name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          {stats.map((stat, index) => {
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
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.name}</h4>
                      <p className="text-sm text-gray-600">by {event.organiser}</p>
                      <p className="text-xs text-gray-500">{event.submittedAt}</p>
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
                    <div className="text-sm text-gray-500">8 events awaiting approval</div>
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
    </div>
  )
}
