'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, TrendingDown, BarChart3, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getMaintenanceRequest } from '@/lib/api'

interface Expense {
  id: string
  amount: string
  category: string
  description: string
  date: string
}

interface MaintenanceRequest {
  id: string
  title: string
  cost?: string
  status: string
  createdAt: string
}

export default function MaintenanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRequest() {
      setLoading(true)
      try {
        const { id } = await params
        const data = await getMaintenanceRequest(id)
        setRequest({
          ...data,
          priority: data.priority,
          status: data.status,
          cost: data.cost ? String(data.cost) : undefined,
          title: data.title,
          description: data.description,
          unit: { unitNumber: '', type: '' },
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params])

  const priorityColors: Record<string, { bg: string; border: string; badge: 'success' | 'warning' | 'error' | 'info' }> = {
    LOW: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', badge: 'info' },
    MEDIUM: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'warning' },
    HIGH: { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', badge: 'warning' },
    EMERGENCY: { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', badge: 'error' },
  }

  const statusColors: Record<string, { bg: string; border: string; badge: 'success' | 'warning' | 'error' | 'info' }> = {
    REPORTED: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', badge: 'info' },
    IN_PROGRESS: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', badge: 'warning' },
    COMPLETED: { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', badge: 'success' },
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
        <Button variant="outline" onClick={() => router.push('/maintenance')}>
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

  if (!request) return null

  const priorityConfig = priorityColors[request.priority] || priorityColors.MEDIUM
  const statusConfig = statusColors[request.status] || statusColors.REPORTED

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/maintenance')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{request.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unit {request.unit?.unitNumber} — {request.unit?.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={priorityConfig.badge}>{request.priority}</Badge>
          <Badge variant={statusConfig.badge}>{request.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">{request.description}</p>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{request.status.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cost</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {request.cost
                    ? new Intl.NumberFormat('fil-PH', {
                        style: 'currency',
                        currency: 'PHP',
                        minimumFractionDigits: 0,
                      }).format(parseFloat(request.cost))
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(request.createdAt).toLocaleDateString('en-PH')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {request.unit?.unitNumber}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
