'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, User, Calendar, AlertCircle } from 'lucide-react'

export default function AdminMessagesPage() {
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  
  // Mock data - replace with real API calls
  const messages = [
    {
      id: 1,
      from: 'Adam Apple',
      fromEmail: 'adam@example.com',
      subject: 'Question about Long Run event',
      body: 'Hi, I have a question about the route details for the Long Run event. Could you please clarify the exact distance and elevation?',
      eventName: 'Long Run',
      eventId: '4a3814a5-15bf-4624-b930-ae37074824d4',
      isRead: false,
      createdAt: '2024-01-15T10:30:00Z',
      type: 'question'
    },
    {
      id: 2,
      from: 'Sarah Smith',
      fromEmail: 'sarah@example.com',
      subject: 'Event approval request',
      body: 'Please review my new marathon event for approval. I have updated all the required information.',
      eventName: 'City Marathon',
      eventId: '5b4925b6-26cf-5735-c941-bf48185935e5',
      isRead: true,
      createdAt: '2024-01-14T15:45:00Z',
      type: 'approval'
    }
  ]

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800'
      case 'approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'complaint':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const handleReply = (message: any) => {
    setSelectedMessage(message)
    setShowReplyModal(true)
  }

  const handleSendReply = () => {
    // TODO: Implement send reply API call
    console.log('Sending reply to:', selectedMessage?.from)
    setShowReplyModal(false)
    setSelectedMessage(null)
  }

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with event organisers</p>
          </div>
          <Button onClick={() => setShowComposeModal(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={`hover:shadow-lg transition-shadow ${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                    <Badge className={getMessageTypeColor(message.type)}>
                      {message.type}
                    </Badge>
                    {!message.isRead && (
                      <Badge className="bg-blue-600 text-white">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {message.from}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getTimeAgo(message.createdAt)}
                    </div>
                    {message.eventName && (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {message.eventName}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {message.body}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReply(message)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                    {message.eventId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/admin/events/${message.eventId}`, '_blank')}
                      >
                        View Event
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages</h3>
            <p className="text-gray-600">No messages from organisers yet.</p>
          </CardContent>
        </Card>
      )}

      {/* Compose Message Modal */}
      <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a message to an organiser
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">To (Organiser Email)</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="organiser@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowComposeModal(false)}
              >
                Cancel
              </Button>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.from}</DialogTitle>
            <DialogDescription>
              Respond to: {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedMessage && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{selectedMessage.body}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="replyMessage">Your Reply</Label>
              <Textarea
                id="replyMessage"
                placeholder="Type your reply here..."
                rows={6}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowReplyModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendReply}>
                <Send className="w-4 h-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
