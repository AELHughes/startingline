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
  Eye
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

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [newMessage, setNewMessage] = useState({
    subject: '',
    body: ''
  })
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    fetchMessages()
    // If user is organiser, get admin user info
    if (user?.role === 'organiser') {
      fetchAdminUser()
    }
  }, [user])

  const fetchAdminUser = async () => {
    try {
      const adminData = await messagesApi.getAdminId()
      setAdminUser(adminData)
    } catch (error) {
      console.error('Failed to fetch admin user:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const messageList = await messagesApi.getMessages()
      setMessages(messageList)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    
    // Mark as read if user is recipient and message is unread
    if (message.recipient_id === user?.id && !message.read_at) {
      try {
        await messagesApi.markAsRead(message.id)
        setMessages(prev => 
          prev.map(m => 
            m.id === message.id 
              ? { ...m, read_at: new Date().toISOString() }
              : m
          )
        )
      } catch (error) {
        console.error('Failed to mark message as read:', error)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.body) {
      alert('Please fill in all fields')
      return
    }

    try {
      // For organisers, recipientId is automatically determined by backend
      // For admins, they would need to specify recipientId (future enhancement)
      await messagesApi.sendMessage({
        recipientId: user?.role === 'organiser' ? undefined : newMessage.recipientId,
        subject: newMessage.subject,
        body: newMessage.body
      })
      
      setNewMessage({ subject: '', body: '' })
      setShowNewMessageDialog(false)
      fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSenderName = (message: Message) => {
    if (message.sender_id === user?.id) {
      return 'You'
    }
    return `${message.sender_first_name} ${message.sender_last_name}`
  }

  const getRecipientName = (message: Message) => {
    if (message.recipient_id === user?.id) {
      return 'You'
    }
    return `${message.recipient_first_name} ${message.recipient_last_name}`
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
    getSenderName(message).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRecipientName(message).toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                Messages
              </h1>
              <p className="text-gray-600">Communicate with administrators and view notifications</p>
            </div>
            
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Send New Message</DialogTitle>
                  <DialogDescription>
                    {user?.role === 'organiser' 
                      ? 'Send a message to the administrator.' 
                      : 'Send a message to an administrator or another organiser.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {user?.role === 'organiser' && adminUser && (
                    <div className="space-y-2">
                      <Label>To</Label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-900">
                          {adminUser.first_name} {adminUser.last_name} (Administrator)
                        </p>
                        <p className="text-xs text-blue-700">{adminUser.email}</p>
                      </div>
                    </div>
                  )}
                  {user?.role !== 'organiser' && (
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Email</Label>
                      <Input
                        id="recipient"
                        placeholder="admin@startingline.com"
                        value={newMessage.recipientId || ''}
                        onChange={(e) => setNewMessage(prev => ({ ...prev, recipientId: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter message subject"
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
                  <Button type="button" variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                    ? 'border-blue-500 text-blue-600'
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
                    ? 'border-blue-500 text-blue-600'
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
                              <p className={`text-sm font-medium truncate ${
                                !message.read_at && message.recipient_id === user?.id ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {activeTab === 'inbox' ? getSenderName(message) : `To: ${getRecipientName(message)}`}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {activeTab === 'inbox' ? message.sender_role : message.recipient_role}
                              </Badge>
                              {!message.read_at && message.recipient_id === user?.id && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                              )}
                              {/* Reply indicator for inbox messages */}
                              {activeTab === 'inbox' && (message as any).hasReplies && (
                                <Badge className="bg-green-100 text-green-800">
                                  Replied
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 font-medium truncate">
                              {message.subject}
                            </p>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {message.body}
                            </p>
                            {message.event_name && (
                              <p className="text-xs text-blue-600 mt-1">
                                Event: {message.event_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {activeTab === 'inbox' 
                            ? `From: ${getSenderName(selectedMessage)} (${selectedMessage.sender_role})`
                            : `To: ${getRecipientName(selectedMessage)} (${selectedMessage.recipient_role})`
                          }
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(selectedMessage.created_at)}
                        </span>
                      </div>
                      {selectedMessage.event_name && (
                        <div className="flex items-center text-sm text-blue-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Event: {selectedMessage.event_name}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                  
                  {activeTab === 'inbox' && (
                    <div className="mt-6 pt-6 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setNewMessage({
                            subject: `Re: ${selectedMessage.subject}`,
                            body: ''
                          })
                          setShowNewMessageDialog(true)
                        }}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
                  <p className="text-gray-600">Choose a conversation from the list to view its details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
