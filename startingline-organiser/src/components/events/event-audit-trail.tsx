'use client'

import React, { useState, useEffect } from 'react'
import { eventsApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  User, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AuditTrailEntry {
  id: string
  action_type: string
  performed_by: string
  performed_by_role: 'organiser' | 'admin'
  message: string
  metadata?: any
  created_at: string
  first_name: string
  last_name: string
  email: string
}

interface EventAuditTrailProps {
  eventId: string
  className?: string
}

const ACTION_ICONS = {
  created: Calendar,
  submitted_for_approval: Send,
  change_requested: Edit,
  admin_updated: User,
  published: CheckCircle,
  cancelled: XCircle,
  rejected: XCircle
}

const ACTION_COLORS = {
  created: 'bg-blue-50 text-blue-700 border-blue-200',
  submitted_for_approval: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  change_requested: 'bg-orange-100 text-orange-800 border-orange-300 border-2',
  admin_updated: 'bg-purple-50 text-purple-700 border-purple-200',
  published: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-red-50 text-red-700 border-red-200'
}

const ACTION_LABELS = {
  created: 'Event Created',
  submitted_for_approval: 'Submitted for Approval',
  change_requested: 'Change Requested',
  admin_updated: 'Admin Update',
  published: 'Published Live',
  cancelled: 'Cancelled',
  rejected: 'Rejected'
}

export default function EventAuditTrail({ eventId, className = '' }: EventAuditTrailProps) {
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    fetchAuditTrail()
  }, [eventId])

  const fetchAuditTrail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const trail = await eventsApi.getEventAuditTrail(eventId)
      setAuditTrail(trail)
      
    } catch (error: any) {
      console.error('❌ Failed to fetch audit trail:', error)
      setError('Failed to load event history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      })
    }
  }

  const getActionIcon = (actionType: string) => {
    const IconComponent = ACTION_ICONS[actionType as keyof typeof ACTION_ICONS] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const getActionColor = (actionType: string) => {
    return ACTION_COLORS[actionType as keyof typeof ACTION_COLORS] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getActionLabel = (actionType: string) => {
    return ACTION_LABELS[actionType as keyof typeof ACTION_LABELS] || actionType
  }

  const getUserName = (entry: AuditTrailEntry) => {
    if (entry.first_name && entry.last_name) {
      return `${entry.first_name} ${entry.last_name}`
    }
    return entry.email
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading event history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={fetchAuditTrail} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort entries to prioritize change requests
  const sortedAuditTrail = [...auditTrail].sort((a, b) => {
    // Change requests first
    if (a.action_type === 'change_requested' && b.action_type !== 'change_requested') return -1
    if (b.action_type === 'change_requested' && a.action_type !== 'change_requested') return 1
    // Then by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
  
  const visibleEntries = isExpanded ? sortedAuditTrail : sortedAuditTrail.slice(0, 3)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Event History
        </CardTitle>
        <p className="text-sm text-gray-600">
          Track all changes and status updates for this event
        </p>
      </CardHeader>
      <CardContent>
        {auditTrail.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleEntries.map((entry, index) => {
              const { date, time } = formatDate(entry.created_at)
              
              return (
                <div 
                  key={entry.id} 
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${getActionColor(entry.action_type)}`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(entry.action_type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">
                          {getActionLabel(entry.action_type)}
                        </h4>
                        <p className="text-sm opacity-90 mt-1">
                          {entry.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs opacity-75">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getUserName(entry)}
                            <Badge variant="outline" className="ml-1 text-xs py-0">
                              {entry.performed_by_role}
                            </Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {date} at {time}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    {entry.metadata && (
                      <div className="mt-3 p-2 bg-white/50 rounded border text-xs">
                        <strong>Details:</strong> {JSON.stringify(entry.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Show More/Less Button */}
            {auditTrail.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show {auditTrail.length - 3} More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
