'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertTriangle, Send } from 'lucide-react'

interface ChangeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  eventName: string
  eventId: string
  onSubmit: (request: string) => Promise<void>
}

export default function ChangeRequestModal({
  isOpen,
  onClose,
  eventName,
  eventId,
  onSubmit
}: ChangeRequestModalProps) {
  const [request, setRequest] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!request.trim()) {
      setError('Please describe the changes you need')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await onSubmit(request.trim())
      setRequest('')
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to submit change request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setRequest('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Event Change Request
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{eventName}</span> has already been submitted for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Event Under Review
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your event is currently being reviewed by administrators. If you need to make changes, 
                  please describe what you'd like updated below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-request">
              What would you like the admin to consider updating before publishing?
            </Label>
            <Textarea
              id="change-request"
              placeholder="Please describe the changes you need. Be specific about what sections or details need to be updated..."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={6}
              className="resize-none"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500">
              This message will be sent to the administrators reviewing your event.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !request.trim()}
          >
            {submitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Change Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
