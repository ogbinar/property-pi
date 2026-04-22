'use client'

import { useState } from 'react'
import { format, addMonths, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { toast } from 'sonner'

interface RenewalModalProps {
  isOpen: boolean
  onClose: () => void
  currentEndDate: string
  currentRent: number
  onRenew: (
    newStartDate: string,
    newEndDate: string,
    newRent: number
  ) => Promise<void>
}

export function RenewalModal({
  isOpen,
  onClose,
  currentEndDate,
  currentRent,
  onRenew,
}: RenewalModalProps) {
  const [newStartDate, setNewStartDate] = useState(
    format(addDays(new Date(currentEndDate), 1), 'yyyy-MM-dd')
  )
  const [newEndDate, setNewEndDate] = useState(
    format(addMonths(new Date(currentEndDate), 12), 'yyyy-MM-dd')
  )
  const [newRent, setNewRent] = useState(currentRent.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newStartDate || !newEndDate) {
      toast.error('Please fill in all dates')
      return
    }
    if (new Date(newEndDate) <= new Date(newStartDate)) {
      toast.error('End date must be after start date')
      return
    }
    const rent = parseFloat(newRent)
    if (isNaN(rent) || rent <= 0) {
      toast.error('Invalid rent amount')
      return
    }

    setIsSubmitting(true)
    try {
      await onRenew(newStartDate, newEndDate, rent)
      onClose()
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Renew Lease"
      onClose={onClose}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Renewing...' : 'Confirm Renewal'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="New Start Date"
          type="date"
          value={newStartDate}
          onChange={(e) => setNewStartDate(e.target.value)}
        />
        <Input
          label="New End Date"
          type="date"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
        />
        <Input
          label="New Monthly Rent (₱)"
          type="number"
          value={newRent}
          onChange={(e) => setNewRent(e.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Current rent: ₱{currentRent.toLocaleString()}/mo
        </p>
      </div>
    </Modal>
  )
}
