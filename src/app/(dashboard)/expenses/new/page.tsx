'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpenseForm, ExpenseFormData } from '@/components/expenses/expense-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NewExpensePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to create expense')
      }

      router.push('/expenses')
      router.refresh()
    } catch (error) {
      console.error('Failed to create expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Expense
        </h2>
      </div>

      <Card>
        <ExpenseForm
          submitLabel="Create Expense"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
