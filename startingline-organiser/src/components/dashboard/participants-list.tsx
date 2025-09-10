'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Download, Mail, Search, Filter, MoreHorizontal,
  Calendar, MapPin, Phone, CheckCircle, XCircle, Users, Plus
} from 'lucide-react'
import { useMyEvents } from '@/hooks/use-events'

export function ParticipantsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [participants, setParticipants] = useState<any[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  
  const { data: myEvents, isLoading, error } = useMyEvents()
  const events = myEvents || []

  // Fetch participants for all events
  useEffect(() => {
    const fetchParticipants = async () => {
      if (events.length === 0) return
      
      setLoadingParticipants(true)
      try {
        const allParticipants = []
        for (const event of events) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/tickets/event/${event.id}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              // Add event info to each participant
              const participantsWithEvent = result.data.map((participant: any) => ({
                ...participant,
                eventName: event.name,
                eventId: event.id
              }))
              allParticipants.push(...participantsWithEvent)
            }
          }
        }
        setParticipants(allParticipants)
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoadingParticipants(false)
      }
    }

    fetchParticipants()
  }, [events])

  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting participants CSV...')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Participants</h3>
            <p className="text-gray-600">There was an issue loading participant data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = !searchTerm || 
      participant.participant_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.participant_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.participant_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEvent = !selectedEvent || participant.eventName === selectedEvent
    
    return matchesSearch && matchesEvent
  })
  
  const uniqueEvents = events.map(e => e.name)

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Event Filter */}
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Events</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Send Emails
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Participants ({filteredParticipants.length})</span>
            <div className="flex items-center gap-2">
              {/* Summary Stats */}
              <div className="text-sm text-gray-500">
                Temp Licenses: {filteredParticipants.filter(p => p.tempLicense === 'Yes').length}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temp License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingParticipants ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredParticipants.length > 0 ? (
                  filteredParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {participant.participant_first_name} {participant.participant_last_name}
                          </div>
                          <div className="text-sm text-gray-500">{participant.participant_email}</div>
                          {participant.participant_mobile && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {participant.participant_mobile}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.eventName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(participant.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={participant.participant_medical_aid ? 'default' : 'secondary'}
                          className={participant.participant_medical_aid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {participant.participant_medical_aid ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{participant.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={participant.status === 'confirmed' ? 'default' : 'secondary'}
                          className={participant.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          <div className="flex items-center">
                            {participant.status === 'confirmed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {participant.status}
                          </div>
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="p-4 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                        <Users className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Found</h3>
                      <p className="text-gray-600">
                        {searchTerm || selectedEvent 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Participants will appear here once people start registering for your events'
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
