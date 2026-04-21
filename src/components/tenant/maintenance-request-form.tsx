'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface MaintenanceRequestFormProps {
  unitId: string
  tenantId: string
  onSubmit: (title: string, description: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void
}

export function MaintenanceRequestForm({
  unitId,
  tenantId,
  onSubmit,
}: MaintenanceRequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [submitting, setSubmitting] = useState(false)

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit(title.trim(), description.trim(), priority)
      setTitle('')
      setDescription('')
      setPriority('medium')
      toast.success('Maintenance request submitted')
    } catch {
      toast.error('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="Submit Maintenance Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Leaky faucet in kitchen"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          required
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(val) =>
            setPriority(val as 'low' | 'medium' | 'high' | 'urgent')
          }
          options={priorityOptions}
          required
        />

        <Button
          type="submit"
          variant="primary"
          isLoading={submitting}
          disabled={submitting}
        >
          Submit Request
        </Button>
      </form>
    </Card>
  )
}
