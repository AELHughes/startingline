'use client'

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Users, Search, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SavedParticipant } from '@/lib/api'

interface ParticipantAllocation {
  participantId: string
  participantIndex: number
}

interface SavedParticipantsModalProps {
  savedParticipants: SavedParticipant[]
  participantAllocations: ParticipantAllocation[]
  participantIndex: number
  currentParticipantId?: string
  onSelectParticipant: (participant: SavedParticipant | null) => Promise<void>
  anyParticipantSelected: boolean
  user: { email: string, first_name: string, last_name: string } | null
  error?: string
}

export default function SavedParticipantsModal({
  savedParticipants,
  participantAllocations,
  participantIndex,
  currentParticipantId,
  onSelectParticipant,
  anyParticipantSelected,
  user,
  error
}: SavedParticipantsModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')

  // Debug logging
  console.log('🔍 SavedParticipantsModal - error prop:', error)

  const filteredAndSortedParticipants = useMemo(() => {
    return savedParticipants
      .filter(participant => {
        const searchLower = searchQuery.toLowerCase()
        return (
          participant.first_name.toLowerCase().includes(searchLower) ||
          participant.last_name.toLowerCase().includes(searchLower) ||
          participant.email.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        } else {
          return new Date(b.date_of_birth).getTime() - new Date(a.date_of_birth).getTime()
        }
      })
  }, [savedParticipants, searchQuery, sortBy])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" />
          Select from your members
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-[90vw] !max-w-[1400px] !sm:max-w-[1400px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select member for Participant {participantIndex + 1}</DialogTitle>
          <DialogDescription>
            Choose a member to auto-fill the participant form. Members who have already been added to this registration will be disabled.
          </DialogDescription>
          {error && (
            <div className="mt-2 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
        </DialogHeader>
        <div className="flex items-center gap-4 p-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={(value: 'name' | 'date') => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="date">Sort by Date of Birth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredAndSortedParticipants.map((participant) => {
            const allocation = participantAllocations.find(a => a.participantId === participant.id)
            const isSelected = allocation !== undefined
            const isDisabled = false // Allow selecting any participant
            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-6 border rounded-lg ${
                  isSelected ? 'bg-gray-50' : 'hover:border-blue-500 hover:bg-gray-50/50'
                }`}
              >
                <div className="grid grid-cols-[200px_1fr_200px_150px] gap-4 items-center min-w-0">
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">
                                    {participant.first_name} {participant.last_name}
                                  </h3>
                                  {user && participant.first_name === user.first_name && participant.last_name === user.last_name && participant.email === user.email && (
                                    <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                      Account Holder
                                    </span>
                                  )}
                                </div>
                              </div>
                  <div className="truncate">
                    <span className="text-sm text-gray-500 mr-2">Email:</span>
                    <span className="text-sm text-gray-900">{participant.email}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-sm text-gray-500 mr-2">Mobile:</span>
                    <span className="text-sm text-gray-900">{participant.mobile}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-sm text-gray-500 mr-2">DOB:</span>
                    <span className="text-sm text-gray-900">
                      {participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString('en-ZA', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      }) : 'Not provided'}
                    </span>
                  </div>
                  {participant.id_document_masked && (
                    <div className="truncate">
                      <span className="text-sm text-gray-500 mr-2">ID:</span>
                      <span className="text-sm text-gray-900 font-mono">{participant.id_document_masked}</span>
                      <span className="text-xs bg-gray-100 px-1 py-0.5 rounded ml-1">
                        {participant.id_document_type === 'sa_id' ? 'SA ID' : 'Passport'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentParticipantId === participant.id ? (
                    <Button
                              onClick={async () => await onSelectParticipant(null)}
                      variant="destructive"
                      size="sm"
                      className="ml-4"
                    >
                      Remove Selection
                    </Button>
                  ) : (
                    <Button
                              onClick={async () => await onSelectParticipant(participant)}
                      disabled={isSelected || isDisabled}
                      variant={isSelected ? "secondary" : "default"}
                      size="sm"
                      className="ml-4"
                    >
                      {isSelected 
                        ? `Allocated to Participant ${allocation!.participantIndex + 1}` 
                        : isDisabled
                          ? 'Complete Current Selection First'
                          : 'Select Member'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
