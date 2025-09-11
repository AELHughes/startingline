'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Mail, Calendar, MapPin, Shield, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Mock data - replace with real API calls
  const users = [
    {
      id: 1,
      firstName: 'Adam',
      lastName: 'Apple',
      email: 'adam@example.com',
      role: 'organiser',
      status: 'active',
      createdAt: '2024-01-10T08:30:00Z',
      lastLogin: '2024-01-15T14:20:00Z',
      eventsCount: 2,
      companyName: 'Apple Events',
      phone: '+27 82 123 4567',
      city: 'Pretoria',
      province: 'Gauteng'
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah@example.com',
      role: 'organiser',
      status: 'active',
      createdAt: '2024-01-12T10:15:00Z',
      lastLogin: '2024-01-14T16:45:00Z',
      eventsCount: 1,
      companyName: 'Smith Sports',
      phone: '+27 83 987 6543',
      city: 'Cape Town',
      province: 'Western Cape'
    },
    {
      id: 3,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'participant',
      status: 'active',
      createdAt: '2024-01-08T12:00:00Z',
      lastLogin: '2024-01-15T09:30:00Z',
      eventsCount: 0,
      companyName: null,
      phone: '+27 84 555 1234',
      city: 'Durban',
      province: 'KwaZulu-Natal'
    }
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'organiser':
        return 'bg-blue-100 text-blue-800'
      case 'participant':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
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

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user: any) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user)
  }

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = () => {
    // TODO: Implement delete user API call
    console.log('Delete user:', selectedUser)
    setShowDeleteModal(false)
    setSelectedUser(null)
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const organisers = users.filter(u => u.role === 'organiser').length
  const participants = users.filter(u => u.role === 'participant').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage platform users and organisers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Organisers</p>
                <p className="text-2xl font-bold text-gray-900">{organisers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">{participants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search users by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {user.email}
                      </div>
                      {user.companyName && (
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          {user.companyName}
                        </div>
                      )}
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.city}, {user.province}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {user.eventsCount} events
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      Joined {getTimeAgo(user.createdAt)} • Last active {getTimeAgo(user.lastLogin)}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewUser(user)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No users match your search criteria.' : 'No users have registered yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-gray-900">{selectedUser.city}, {selectedUser.province}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Events Created</Label>
                  <p className="text-gray-900">{selectedUser.eventsCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Joined</Label>
                  <p className="text-gray-900">{getTimeAgo(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Active</Label>
                  <p className="text-gray-900">{getTimeAgo(selectedUser.lastLogin)}</p>
                </div>
              </div>
              
              {selectedUser.companyName && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Company</Label>
                  <p className="text-gray-900">{selectedUser.companyName}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => setShowUserModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
            >
              Delete User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
