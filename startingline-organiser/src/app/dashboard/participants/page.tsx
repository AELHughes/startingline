'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { eventsApi, type Event } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Download,
  AlertCircle,
  BarChart3,
  PieChart,
  UserCheck,
  UserX,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ParticipantAnalytics {
  event: {
    id: string
    name: string
    start_date: string
    start_time: string
    city: string
  }
  summary: {
    total_participants: number
    active_participants: number
    disabled_participants: number
    total_entry_limit: number
    utilization_percentage: number
  }
  distances: Array<{
    id: string
    name: string
    price: number
    entry_limit: number
    min_age?: number
    start_time?: string
    participant_count: number
    active_participants: number
    utilization_percentage: number
  }>
  participants: Array<{
    ticket_id: string
    ticket_number: string
    participant_first_name: string
    participant_last_name: string
    participant_email: string
    participant_mobile: string
    participant_date_of_birth: string
    participant_disabled: boolean
    participant_medical_aid_name?: string
    participant_medical_aid_number?: string
    emergency_contact_name: string
    emergency_contact_number: string
    amount: number
    status: string
    created_at: string
    distance_name: string
    distance_price: number
    account_holder_first_name: string
    account_holder_last_name: string
    account_holder_email: string
  }>
}

export default function ParticipantsDashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [analytics, setAnalytics] = useState<ParticipantAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  useEffect(() => {
    if (selectedEventId) {
      fetchAnalytics(selectedEventId)
    }
  }, [selectedEventId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getMyEvents()
      setEvents(response)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async (eventId: string) => {
    try {
      setAnalyticsLoading(true)
      setError('')
      
      const response = await eventsApi.getParticipantAnalytics(eventId)
      
      if (response.success && response.data) {
        setAnalytics(response.data)
      } else {
        setError(response.error || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load participant analytics')
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!analytics) return

    const headers = [
      'Ticket Number',
      'Participant Name',
      'Email',
      'Mobile',
      'Date of Birth',
      'Distance',
      'Price',
      'Status',
      'Disabled',
      'Medical Aid Name',
      'Medical Aid Number',
      'Emergency Contact Name',
      'Emergency Contact Number',
      'Account Holder Name',
      'Account Holder Email',
      'Registration Date'
    ]

    const csvContent = [
      headers.join(','),
      ...analytics.participants.map(participant => [
        participant.ticket_number,
        `"${participant.participant_first_name} ${participant.participant_last_name}"`,
        participant.participant_email,
        participant.participant_mobile,
        participant.participant_date_of_birth,
        participant.distance_name,
        participant.amount,
        participant.status,
        participant.participant_disabled ? 'Yes' : 'No',
        participant.participant_medical_aid_name || '',
        participant.participant_medical_aid_number || '',
        participant.emergency_contact_name,
        participant.emergency_contact_number,
        `"${participant.account_holder_first_name} ${participant.account_holder_last_name}"`,
        participant.account_holder_email,
        format(new Date(participant.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${analytics.event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Prepare chart data
  const getDistanceChartData = () => {
    if (!analytics) return []
    return analytics.distances.map(distance => ({
      name: distance.name,
      participants: distance.active_participants,
      limit: distance.entry_limit,
      utilization: distance.utilization_percentage
    }))
  }

  const getUtilizationChartData = () => {
    if (!analytics) return []
    return [
      {
        name: 'Registered',
        value: analytics.summary.active_participants,
        color: '#3B82F6'
      },
      {
        name: 'Available',
        value: Math.max(0, analytics.summary.total_entry_limit - analytics.summary.active_participants),
        color: '#E5E7EB'
      }
    ]
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Participants Dashboard</h1>
          <p className="text-gray-600">Analyze participant registrations and export data for your events</p>
        </div>

        {/* Event Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Event
            </CardTitle>
            <CardDescription>
              Choose an event to view participant analytics and export data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.city}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {analytics && (
                <Button onClick={exportToCSV} className="ml-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analyticsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        )}

        {analytics && (
          <>
            {/* Event Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {analytics.event.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(analytics.event.start_date), 'EEEE, MMMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {analytics.event.start_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {analytics.event.city}
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.summary.total_participants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Participants</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.summary.active_participants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Entry Limit</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.summary.total_entry_limit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.summary.utilization_percentage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distance Participation Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distance Participation
                  </CardTitle>
                  <CardDescription>
                    Number of participants per distance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDistanceChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            value, 
                            name === 'participants' ? 'Participants' : 'Entry Limit'
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="participants" fill="#3B82F6" name="Participants" />
                        <Bar dataKey="limit" fill="#E5E7EB" name="Entry Limit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Utilization Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Overall Utilization
                  </CardTitle>
                  <CardDescription>
                    Registered vs Available spots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getUtilizationChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getUtilizationChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distance Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distance Breakdown
                </CardTitle>
                <CardDescription>
                  Participant distribution across different distances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.distances.map((distance) => (
                    <div key={distance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{distance.name}</h3>
                          <Badge variant="outline">R{distance.price}</Badge>
                          {distance.min_age && (
                            <Badge variant="secondary">Min age: {distance.min_age}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{distance.active_participants} participants</span>
                          {distance.entry_limit > 0 && (
                            <span>of {distance.entry_limit} limit</span>
                          )}
                          {distance.start_time && (
                            <span>• Starts at {distance.start_time}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {distance.active_participants}
                        </div>
                        {distance.entry_limit > 0 && (
                          <div className="text-sm text-gray-600">
                            {distance.utilization_percentage}% utilized
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Participants Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Participants ({analytics.participants.length})
                </CardTitle>
                <CardDescription>
                  Complete list of registered participants with all details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Ticket #</th>
                        <th className="text-left py-3 px-2">Name</th>
                        <th className="text-left py-3 px-2">Email</th>
                        <th className="text-left py-3 px-2">Mobile</th>
                        <th className="text-left py-3 px-2">Distance</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Medical Aid</th>
                        <th className="text-left py-3 px-2">Emergency Contact</th>
                        <th className="text-left py-3 px-2">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.participants.map((participant) => (
                        <tr key={participant.ticket_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-mono text-xs">
                            {participant.ticket_number}
                          </td>
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium">
                                {participant.participant_first_name} {participant.participant_last_name}
                              </div>
                              {participant.participant_disabled && (
                                <Badge variant="secondary" className="text-xs mt-1">Disabled</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2">{participant.participant_email}</td>
                          <td className="py-3 px-2">{participant.participant_mobile}</td>
                          <td className="py-3 px-2">
                            <div>
                              <div className="font-medium">{participant.distance_name}</div>
                              <div className="text-xs text-gray-500">R{participant.amount}</div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge 
                              variant={participant.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {participant.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {participant.participant_medical_aid_name ? (
                              <div className="text-xs">
                                <div>{participant.participant_medical_aid_name}</div>
                                <div className="text-gray-500">{participant.participant_medical_aid_number}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-xs">
                              <div>{participant.emergency_contact_name}</div>
                              <div className="text-gray-500">{participant.emergency_contact_number}</div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-500">
                            {format(new Date(participant.created_at), 'MMM dd, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedEventId && !analyticsLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
              <p className="text-gray-600">Choose an event from the dropdown above to view participant analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
