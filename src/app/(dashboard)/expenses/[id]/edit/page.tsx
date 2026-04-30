'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExpenseForm, ExpenseFormData } from '@/components/expenses/expense-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { updateExpenseAction, deleteExpenseAction, getExpenseAction } from '@/app/actions/expense-actions'
import type { Expense } from '@/app/actions/expense-actions'

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    async function fetchExpense() {
      try {
        const { id } = await params
        const data = await getExpenseAction(id)
        setExpense(data as Expense)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load expense')
      } finally {
        setLoading(false)
      }
    }

    fetchExpense()
  }, [params])

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

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Expense not found
        </h2>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/expenses')}>
          Back to Expenses
        </Button>
      </div>
    )
  }

  async function handleSubmit(data: ExpenseFormData) {
    try {
      await updateExpenseAction(expense!.id, {
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
        unit_id: data.unitId || undefined,
        receipt_url: data.receiptUrl || undefined,
      })
      toast.success('Expense updated successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update expense')
    }
  }

  async function handleDelete() {
    if (!expense) return
    try {
      await deleteExpenseAction(expense.id)
      toast.success('Expense deleted successfully')
      router.push('/expenses')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete expense')
    }
  }

  const defaultValues = {
    amount: String(expense.amount),
    category: expense.category,
    description: expense.description,
    date: expense.date,
    unitId: expense.unit_id || undefined,
    receiptUrl: expense.receipt_url || undefined,
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
          defaultValues={defaultValues}
          submitLabel="Update Expense"
          onSubmit={handleSubmit}
          isLoading={false}
          onCancel={() => router.back()}
        />
      </Card>

      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        actions={[
          <Button key="cancel" variant="outline" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>,
          <Button key="delete" variant="danger" onClick={handleDelete}>
            Delete
          </Button>,
        ]}
      />
    </div>
  )
}
