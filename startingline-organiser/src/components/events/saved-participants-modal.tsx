'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import { SavedParticipant } from '@/lib/api'

interface SavedParticipantsModalProps {
  savedParticipants: SavedParticipant[]
  selectedParticipantIds: string[]
  onSelectParticipant: (participant: SavedParticipant) => void
}

export default function SavedParticipantsModal({
  savedParticipants,
  selectedParticipantIds,
  onSelectParticipant
}: SavedParticipantsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" />
          Select from your members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select from your saved members</DialogTitle>
          <DialogDescription>
            Choose a member to auto-fill the participant form. Members who have already been added to this registration will be disabled.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {savedParticipants.map((participant) => {
            const isSelected = selectedParticipantIds.includes(participant.id)
            return (
              <div
                key={participant.id}
                className={`p-4 border rounded-lg ${
                  isSelected ? 'bg-gray-100' : 'hover:border-blue-500'
                }`}
              >
                <div className="flex flex-col space-y-2">
                  <h3 className="font-semibold">
                    {participant.first_name} {participant.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{participant.email}</p>
                  <p className="text-sm text-gray-600">{participant.mobile}</p>
                  <Button
                    onClick={() => onSelectParticipant(participant)}
                    disabled={isSelected}
                    variant={isSelected ? "secondary" : "default"}
                    size="sm"
                    className="mt-2"
                  >
                    {isSelected ? 'Already Added' : 'Select Member'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
