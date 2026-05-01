import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { MonthPicker } from '../components/rent/MonthPicker.jsx'
import { RentCollectionTable } from '../components/rent/RentCollectionTable.jsx'
import { apiRequest } from '../api.js'

const statusColors = {
  PAID: 'success',
  OVERDUE: 'error',
  PENDING: 'warning',
}

function formatPHP(amount) {
  return new Intl.NumberFormat('fil-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function RentCollectionPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMarkingOverdue, setIsMarkingOverdue] = useState(false)

  const loadData = useCallback(async (date) => {
    setIsLoading(true)
    try {
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const [paymentsRes, summaryRes] = await Promise.all([
        apiRequest(`/api/payments?month=${month}&year=${year}`),
        apiRequest(`/api/payments/summary?month=${month}&year=${year}`),
      ])

      const payments = paymentsRes || []

      const enrichedPayments = payments.map((p) => {
        const dueDate = new Date(p.due_date)
        const now = new Date()
        const daysOverdue = p.status === 'OVERDUE' || now > dueDate
          ? Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
          : 0
        const daysUntilDue = p.status === 'PAID' || now > dueDate
          ? 0
          : Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
          id: p.id,
          unitId: p.unit_id,
          amount: parseFloat(p.amount),
          status: p.status.toUpperCase(),
          date: p.date,
          dueDate: p.due_date,
          daysOverdue,
          daysUntilDue,
          tenant: '',
          unitNumber: '',
        }
      })

      setData({
        month,
        year,
        payments: enrichedPayments,
        summary: {
          totalExpected: parseFloat(summaryRes.expected || 0),
          totalCollected: parseFloat(summaryRes.collected || 0),
          totalOverdue: parseFloat(summaryRes.overdue || 0),
          totalPending: parseFloat(summaryRes.pending || 0),
          collectedPercent: (summaryRes.expected || 0) > 0
            ? (parseFloat(summaryRes.collected) / parseFloat(summaryRes.expected)) * 100
            : 0,
        },
      })
    } catch {
      toast.error('Failed to load rent data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(currentDate)
  }, [currentDate, loadData])

  const handleGenerateRent = async () => {
    setIsGenerating(true)
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const result = await apiRequest(`/api/payments/generate?month=${month}&year=${year}`, {
        method: 'POST',
      })
      toast.success(`Generated ${result.created} rent records`)
      await loadData(currentDate)
    } catch {
      toast.error('Failed to generate rent records')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMarkOverdue = async () => {
    setIsMarkingOverdue(true)
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      await apiRequest(`/api/payments/mark-overdue?month=${month}&year=${year}`, {
        method: 'POST',
      })
      toast.success('Pending payments marked as overdue')
      await loadData(currentDate)
    } catch {
      toast.error('Failed to mark payments as overdue')
    } finally {
      setIsMarkingOverdue(false)
    }
  }

  const handleMarkPaid = async (paymentId) => {
    try {
      await apiRequest(`/api/payments/${paymentId}/mark-paid`, {
        method: 'POST',
      })
      toast.success('Marked as paid')
      await loadData(currentDate)
    } catch {
      toast.error('Failed to mark as paid')
    }
  }

  const handlePrevMonth = () => {
    const prev = new Date(currentDate)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentDate(prev)
  }

  const handleNextMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  }

  const monthName = currentDate.toLocaleDateString('fil-PH', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage monthly rent collections and track payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" onClick={handlePrevMonth}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <MonthPicker value={currentDate} onChange={(date) => setCurrentDate(date)} />
            <Button variant="secondary" size="sm" onClick={handleNextMonth}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button
            id="mark-overdue-btn"
            variant="outline"
            size="sm"
            onClick={handleMarkOverdue}
            isLoading={isMarkingOverdue}
          >
            Mark Overdue
          </Button>
          <Button
            id="generate-rent-btn"
            variant="primary"
            size="sm"
            onClick={handleGenerateRent}
            isLoading={isGenerating}
          >
            Generate Rent
          </Button>
        </div>
      </div>

      {/* Month Title */}
      <Card className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
      </Card>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expected</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPHP(data.summary.totalExpected)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Collected</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatPHP(data.summary.totalCollected)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{data.summary.collectedPercent.toFixed(1)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {formatPHP(data.summary.totalPending)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {formatPHP(data.summary.totalOverdue)}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <RentCollectionTable
        records={data?.payments || []}
        onMarkPaid={handleMarkPaid}
        isLoading={isLoading}
      />
    </div>
  )
}
