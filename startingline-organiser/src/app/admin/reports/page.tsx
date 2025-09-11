'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, TrendingUp, Users, MapPin, DollarSign, Download, Filter } from 'lucide-react'

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedReport, setSelectedReport] = useState('overview')

  // Mock data - replace with real API calls
  const overviewStats = {
    totalEvents: 15,
    publishedEvents: 12,
    pendingEvents: 2,
    cancelledEvents: 1,
    totalOrganisers: 8,
    totalParticipants: 245,
    totalRevenue: 125000,
    avgEventValue: 8333
  }

  const eventStats = [
    { name: 'Marathon Events', count: 5, revenue: 45000, participants: 120 },
    { name: 'Trail Running', count: 4, revenue: 32000, participants: 80 },
    { name: 'Triathlon', count: 3, revenue: 28000, participants: 35 },
    { name: 'Mountain Biking', count: 3, revenue: 20000, participants: 10 }
  ]

  const topOrganisers = [
    { name: 'Adam Apple', events: 3, revenue: 25000, participants: 65 },
    { name: 'Sarah Smith', events: 2, revenue: 18000, participants: 45 },
    { name: 'Mike Johnson', events: 2, revenue: 15000, participants: 40 },
    { name: 'Lisa Brown', events: 1, revenue: 12000, participants: 30 }
  ]

  const recentActivity = [
    { type: 'event_created', user: 'Adam Apple', event: 'Long Run', time: '2 hours ago' },
    { type: 'event_published', user: 'Sarah Smith', event: 'City Marathon', time: '5 hours ago' },
    { type: 'user_registered', user: 'John Doe', event: null, time: '1 day ago' },
    { type: 'event_cancelled', user: 'Mike Johnson', event: 'Trail Challenge', time: '2 days ago' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event_created':
        return <Calendar className="w-4 h-4 text-blue-600" />
      case 'event_published':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'user_registered':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'event_cancelled':
        return <Calendar className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'event_created':
        return 'bg-blue-100 text-blue-800'
      case 'event_published':
        return 'bg-green-100 text-green-800'
      case 'user_registered':
        return 'bg-purple-100 text-purple-800'
      case 'event_cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report for period:', selectedPeriod)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Platform performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.totalEvents}</p>
                <p className="text-xs text-gray-500">{overviewStats.publishedEvents} published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.totalOrganisers + overviewStats.totalParticipants}</p>
                <p className="text-xs text-gray-500">{overviewStats.totalOrganisers} organisers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(overviewStats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">Avg: {formatCurrency(overviewStats.avgEventValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
                <p className="text-xs text-gray-500">vs last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{stat.name}</h4>
                    <p className="text-sm text-gray-600">{stat.participants} participants</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{stat.count} events</p>
                    <p className="text-sm text-gray-600">{formatCurrency(stat.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Organisers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organisers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOrganisers.map((organiser, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {organiser.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{organiser.name}</h4>
                      <p className="text-sm text-gray-600">{organiser.participants} participants</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{organiser.events} events</p>
                    <p className="text-sm text-gray-600">{formatCurrency(organiser.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{activity.user}</span>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    {activity.event && (
                      <span className="text-gray-600">- {activity.event}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Gauteng</h3>
              <p className="text-2xl font-bold text-blue-600">8 events</p>
              <p className="text-sm text-gray-600">120 participants</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Western Cape</h3>
              <p className="text-2xl font-bold text-green-600">4 events</p>
              <p className="text-sm text-gray-600">65 participants</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">KwaZulu-Natal</h3>
              <p className="text-2xl font-bold text-purple-600">3 events</p>
              <p className="text-sm text-gray-600">60 participants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
