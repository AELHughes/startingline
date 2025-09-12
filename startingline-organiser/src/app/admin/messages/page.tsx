'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { messagesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Search, 
  User, 
  Calendar,
  Clock,
  Reply,
  Eye,
  ExternalLink
} from 'lucide-react'

interface Message {
  id: string
  event_id?: string
  sender_id: string
  recipient_id: string
  subject: string
  body: string
  parent_message_id?: string
  read_at?: string
  created_at: string
  sender_first_name: string
  sender_last_name: string
  sender_email: string
  sender_role: string
  recipient_first_name: string
  recipient_last_name: string
  recipient_email: string
  recipient_role: string
  event_name?: string
}

export default function AdminMessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    body: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const messageList = await messagesApi.getMessages()
      setMessages(messageList)
      
      // Select first message if none selected
      if (messageList.length > 0 && !selectedMessage) {
        setSelectedMessage(messageList[0])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    
    // Mark as read if it's unread and we're the recipient
    if (!message.read_at && message.recipient_id === user?.id) {
      try {
        await messagesApi.markAsRead(message.id)
        // Update local state
        setMessages(prev => 
          prev.map(m => 
            m.id === message.id 
              ? { ...m, read_at: new Date().toISOString() }
              : m
          )
        )
        setSelectedMessage(prev => prev ? { ...prev, read_at: new Date().toISOString() } : null)
      } catch (error) {
        console.error('Failed to mark message as read:', error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.body || !newMessage.recipientId) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      await messagesApi.sendMessage({
        recipientId: newMessage.recipientId,
        subject: newMessage.subject,
        body: newMessage.body
      })
      setNewMessage({ recipientId: '', subject: '', body: '' })
      setShowNewMessageDialog(false)
      fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !newMessage.body) {
      alert('Please enter a reply message')
      return
    }
    
    try {
      await messagesApi.sendMessage({
        recipientId: selectedMessage.sender_id,
        subject: `Re: ${selectedMessage.subject}`,
        body: newMessage.body,
        parentMessageId: selectedMessage.id
      })
      setNewMessage({ recipientId: '', subject: '', body: '' })
      setShowNewMessageDialog(false)
      fetchMessages()
    } catch (error) {
      console.error('Failed to send reply:', error)
      alert('Failed to send reply')
    }
  }

  // Separate messages into inbox and sent
  const inboxMessages = messages.filter(message => message.recipient_id === user?.id)
  const sentMessages = messages.filter(message => message.sender_id === user?.id)
  
  // Add reply indicators to inbox messages
  const inboxWithReplyStatus = inboxMessages.map(message => {
    const hasReplies = messages.some(m => 
      m.parent_message_id === message.id && m.sender_id === user?.id
    )
    return { ...message, hasReplies }
  })
  
  // Filter messages based on active tab and search term
  const currentMessages = activeTab === 'inbox' ? inboxWithReplyStatus : sentMessages
  const filteredMessages = currentMessages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${message.sender_first_name} ${message.sender_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${message.recipient_first_name} ${message.recipient_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const getMessageType = (message: Message) => {
    if (message.subject.toLowerCase().includes('approval')) return 'approval'
    if (message.subject.toLowerCase().includes('question')) return 'question'
    if (message.subject.toLowerCase().includes('complaint')) return 'complaint'
    return 'general'
  }

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Communicate with event organisers</p>
          </div>
          <Button onClick={() => setShowNewMessageDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('inbox')
                setSelectedMessage(null)
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inbox'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inbox ({inboxMessages.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('sent')
                setSelectedMessage(null)
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sent ({sentMessages.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${activeTab} messages...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {activeTab === 'inbox' ? 'Inbox' : 'Sent Items'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {activeTab === 'inbox' ? 'No messages in inbox' : 'No sent messages'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${
                        !message.read_at && message.recipient_id === user?.id ? 'bg-blue-25' : ''
                      }`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {message.subject}
                            </h4>
                            <Badge className={getMessageTypeColor(getMessageType(message))}>
                              {getMessageType(message)}
                            </Badge>
                            {!message.read_at && message.recipient_id === user?.id && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                            )}
                            {/* Reply indicator for inbox messages */}
                            {activeTab === 'inbox' && (message as any).hasReplies && (
                              <Badge className="bg-green-100 text-green-800">
                                Replied
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                            <User className="h-3 w-3" />
                            <span>
                              {activeTab === 'inbox' 
                                ? `${message.sender_first_name} ${message.sender_last_name}`
                                : `To: ${message.recipient_first_name} ${message.recipient_last_name}`
                              }
                            </span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(message.created_at)}</span>
                          </div>
                          
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {message.body}
                          </p>
                          
                          {message.event_name && (
                            <div className="flex items-center mt-2 text-xs text-blue-600">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{message.event_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      <Badge className={getMessageTypeColor(getMessageType(selectedMessage))}>
                        {getMessageType(selectedMessage)}
                      </Badge>
                      {!selectedMessage.read_at && selectedMessage.recipient_id === user?.id && (
                        <Badge className="bg-blue-600 text-white">New</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium">
                          {activeTab === 'inbox' 
                            ? `From: ${selectedMessage.sender_first_name} ${selectedMessage.sender_last_name} (${selectedMessage.sender_email})`
                            : `To: ${selectedMessage.recipient_first_name} ${selectedMessage.recipient_last_name} (${selectedMessage.recipient_email})`
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTimeAgo(selectedMessage.created_at)}
                      </div>
                      {selectedMessage.event_name && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{selectedMessage.event_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {activeTab === 'inbox' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNewMessage({
                            recipientId: selectedMessage.sender_id,
                            subject: `Re: ${selectedMessage.subject}`,
                            body: ''
                          })
                          setShowNewMessageDialog(true)
                        }}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    )}
                    {selectedMessage.event_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/admin/events/${selectedMessage.event_id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Event
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {selectedMessage.body}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view its content.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage && activeTab === 'inbox' ? 'Reply to Message' : 'Compose Message'}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && activeTab === 'inbox'
                ? `Reply to: ${selectedMessage.subject}`
                : 'Send a message to an organiser'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!selectedMessage && (
              <div className="space-y-2">
                <Label htmlFor="recipient">To (Organiser Email)</Label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="organiser@example.com"
                  value={newMessage.recipientId}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, recipientId: e.target.value }))}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Message subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Type your message here..."
                rows={6}
                value={newMessage.body}
                onChange={(e) => setNewMessage(prev => ({ ...prev, body: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewMessageDialog(false)
                setNewMessage({ recipientId: '', subject: '', body: '' })
              }}
            >
              Cancel
            </Button>
            <Button onClick={selectedMessage && activeTab === 'inbox' ? handleReply : handleSendMessage}>
              <Send className="w-4 h-4 mr-2" />
              {selectedMessage && activeTab === 'inbox' ? 'Send Reply' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}