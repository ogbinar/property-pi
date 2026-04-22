'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExpenseForm, ExpenseFormData } from '@/components/expenses/expense-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExpense() {
      try {
        const res = await fetch(`/api/expenses/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch expense')
        const data = await res.json()

        // Store in a hidden way for the form
        const form = document.querySelector('#expense-form') as HTMLFormElement
        if (form) {
          // We'll use the form's defaultValues via a different approach
        }
      } catch (error) {
        console.error('Failed to fetch expense:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpense()
  }, [params.id])

  const handleSubmit = async (data: ExpenseFormData) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/expenses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Failed to update expense')
      }

      router.push('/expenses')
      router.refresh()
    } catch (error) {
      console.error('Failed to update expense:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Expense
        </h2>
      </div>

      <Card>
        <ExpenseForm
          submitLabel="Update Expense"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
