'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceForm, MaintenanceFormData } from '@/components/maintenance/maintenance-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getMaintenanceRequest, updateMaintenance } from '@/lib/api'

export default function EditMaintenancePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<{
    title: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
    unitId: string
    cost?: string
    status?: string
  }>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    unitId: '',
    cost: '',
  })

  useEffect(() => {
    async function fetchRequest() {
      try {
        const data = await getMaintenanceRequest(params.id)
        setRequest({
          title: data.title,
          description: data.description,
          priority: data.priority === 'urgent' ? 'EMERGENCY' : data.priority === 'high' ? 'HIGH' : data.priority === 'medium' ? 'MEDIUM' : 'LOW',
          unitId: data.unit_id,
          cost: data.cost !== null ? String(data.cost) : '',
          status: data.status,
        })
      } catch (error) {
        console.error('Failed to fetch maintenance request:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequest()
  }, [params.id])

  const handleSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true)
    try {
      await updateMaintenance(params.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: request.status || 'open',
        cost: data.cost ? Number(data.cost) : undefined,
      })
      router.push('/maintenance')
      router.refresh()
    } catch (error) {
      console.error('Failed to update maintenance request:', error)
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
          Edit Maintenance Request
        </h2>
      </div>

      <Card>
        <MaintenanceForm
          defaultValues={request}
          submitLabel="Update Request"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          units={[]}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
