'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { getExpenseAction, deleteExpenseAction } from '@/app/actions/expense-actions'
import type { Expense } from '@/app/actions/expense-actions'

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    async function fetchExpense() {
      setLoading(true)
      try {
        const { id } = await params
        const data = await getExpenseAction(id)
        setExpense(data as Expense)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchExpense()
  }, [params])

  const handleDelete = async () => {
    if (!expense) return
    try {
      await deleteExpenseAction(expense.id)
      router.push('/expenses')
    } catch {
      setError('Failed to delete expense')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push('/expenses')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!expense) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/expenses')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{expense.description}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {expense.category}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
            <Trash2Icon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Details */}
      <Card>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {new Intl.NumberFormat('fil-PH', {
                  style: 'currency',
                  currency: 'PHP',
                  minimumFractionDigits: 0,
                }).format(expense.amount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <EditIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{expense.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {new Date(expense.date).toLocaleDateString('en-PH')}
              </p>
            </div>
          </div>
          {expense.unit_id && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BuildingIcon />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit ID</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{expense.unit_id}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        actions={[
          <Button key="cancel" variant="outline" onClick={() => setShowDeleteModal(false)}>
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

function CalendarIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}

function BuildingIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 16V5a2 2 0 012-2h6a2 2 0 012 2v16M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
}

function EditIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.415-9.829A6.394 6.394 0 0118 12h.784a2.158 2.158 0 012.158 2.158v2.714a2.158 2.158 0 01-2.158 2.158H18a2 2 0 00-2 2v5a2 2 0 01-3.273 1.636l-5.273-3.515a2 2 0 00-2.454 0l-5.273 3.515A2 2 0 003 18.571v-5.714a2 2 0 01-2-2.158V8.857a2 2 0 012-2h6" /></svg>
}

function Trash2Icon({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v3m4-3V5m-4 0h4M5 7v5a2 2 0 002 2h10a2 2 0 002-2V7m-4 4a2 2 0 002 2h4a2 2 0 002-2m-9 0h6" /></svg>
}
