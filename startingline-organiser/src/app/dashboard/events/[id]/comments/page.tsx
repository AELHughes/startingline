'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare, User, Calendar } from 'lucide-react'
import { eventsApi } from '@/lib/api'

// Use the existing API service to fetch event details
const fetchEventDetails = async (eventId: string) => {
  return await eventsApi.getEventById(eventId)
}

export default function EventCommentsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  // Fetch event data
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEventDetails(eventId),
    enabled: !!eventId
  })

  // Fetch admin comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['admin-comments', eventId],
    queryFn: () => eventsApi.getAdminComments(eventId),
    enabled: !!eventId
  })

  if (isLoading || commentsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load comments. Please try again.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Event not found.</p>
        </div>
      </div>
    )
  }

  // Group comments by section
  const commentsBySection = comments.reduce((acc: any, comment: any) => {
    if (!acc[comment.section]) {
      acc[comment.section] = []
    }
    acc[comment.section].push(comment)
    return acc
  }, {})

  const sections = ['overview', 'location', 'distances', 'merchandise', 'organiser']

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Comments</h1>
            <p className="text-gray-600 mt-2">Feedback from administrators on your event</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {event.name}
          </Badge>
        </div>
      </div>

      {/* Comments by Section */}
      {comments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
              <p className="text-gray-600">
                You haven't received any comments from administrators yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            const sectionComments = commentsBySection[section] || []
            if (sectionComments.length === 0) return null

            return (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="capitalize flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {section} Section
                    <Badge variant="secondary" className="ml-2">
                      {sectionComments.length} comment{sectionComments.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sectionComments.map((comment: any) => (
                      <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {comment.first_name} {comment.last_name}
                            </span>
                            <span className="text-sm text-gray-500">({comment.email})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
