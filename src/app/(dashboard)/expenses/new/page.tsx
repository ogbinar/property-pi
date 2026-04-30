'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExpenseForm, ExpenseFormData } from '@/components/expenses/expense-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createExpenseAction } from '@/app/actions/expense-actions'

export default function NewExpensePage() {
  const router = useRouter()

  async function handleSubmit(data: ExpenseFormData) {
    try {
      await createExpenseAction({
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        unit_id: data.unitId || undefined,
        receipt_url: data.receiptUrl || undefined,
      })
      toast.success('Expense created successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create expense')
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
          isLoading={false}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
