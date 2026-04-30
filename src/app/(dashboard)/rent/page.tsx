'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RentTable } from '@/components/rent/rent-table'
import { RentSummary } from '@/components/rent/rent-summary'
import { MonthPicker } from '@/components/rent/month-picker'
import { toast } from 'sonner'
import { getMonthRentAction, generateRentAction, markPaidAction, markOverdueAction } from '@/app/actions/payment-actions'

interface RentRecord {
  id: string
  unitId: string
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE'
  date: string
  dueDate: string
  daysOverdue: number
  daysUntilDue: number
  tenant: string
  unitNumber: string
}

interface RentData {
  month: number
  year: number
  payments: RentRecord[]
  summary: {
    totalExpected: number
    totalCollected: number
    totalOverdue: number
    totalPending: number
    collectedPercent: number
  }
}

export default function RentPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [data, setData] = useState<RentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isMarkingOverdue, setIsMarkingOverdue] = useState(false)

  const loadData = useCallback(async (date: Date) => {
    setIsLoading(true)
    try {
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const result = await getMonthRentAction(month, year)
      setData({
        month,
        year,
        payments: result.payments.map((p) => ({
          id: p.id,
          unitId: p.unit_id,
          amount: p.amount,
          status: p.status as 'PENDING' | 'PAID' | 'OVERDUE',
          date: p.date,
          dueDate: p.due_date,
          daysOverdue: Math.max(0, Math.floor((Date.now() - new Date(p.due_date).getTime()) / (1000 * 60 * 60 * 24))),
          daysUntilDue: Math.max(0, Math.floor((new Date(p.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          tenant: '',
          unitNumber: '',
        })),
        summary: {
          totalExpected: result.summary.expected,
          totalCollected: result.summary.collected,
          totalOverdue: result.summary.overdue,
          totalPending: result.summary.pending,
          collectedPercent: result.summary.expected > 0
            ? (result.summary.collected / result.summary.expected) * 100
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
      const result = await generateRentAction({ month, year })
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
      const result = await markOverdueAction(month, year)
      toast.success(`Pending payments marked as overdue`)
      await loadData(currentDate)
    } catch {
      toast.error('Failed to mark payments as overdue')
    } finally {
      setIsMarkingOverdue(false)
    }
  }

  const handleMarkPaid = async (paymentId: string) => {
    try {
      await markPaidAction(paymentId)
      toast.success('Marked as paid')
      await loadData(currentDate)
    } catch {
      toast.error('Failed to mark as paid')
    }
  }

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date)
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
              <MonthPicker value={currentDate} onChange={handleMonthChange} />
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
        <RentSummary
          totalExpected={data.summary.totalExpected}
          totalCollected={data.summary.totalCollected}
          totalOverdue={data.summary.totalOverdue}
          totalPending={data.summary.totalPending}
          collectedPercent={data.summary.collectedPercent}
        />
      )}

      {/* Table */}
      <RentTable
        records={data?.payments || []}
        onMarkPaid={handleMarkPaid}
        isLoading={isLoading}
      />
    </div>
  )
}
