'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MaintenanceForm, MaintenanceFormData } from '@/components/maintenance/maintenance-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUnits, createMaintenance, UnitWithRelations } from '@/lib/api'

export default function NewMaintenancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [units, setUnits] = useState<Array<{ id: string; unitNumber: string }>>([])

  useEffect(() => {
    async function fetchUnits() {
      try {
        const data = await getUnits()
        setUnits(data.map((u: UnitWithRelations) => ({
          id: u.id,
          unitNumber: u.unit_number,
        })))
      } catch (error) {
        console.error('Failed to fetch units:', error)
      }
    }

    fetchUnits()
  }, [])

  const handleSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true)
    try {
      await createMaintenance({
        title: data.title,
        description: data.description,
        priority: data.priority || 'MEDIUM',
        unit_id: data.unitId,
        cost: data.cost ? Number(data.cost) : undefined,
      })
      router.push('/maintenance')
      router.refresh()
    } catch (error) {
      console.error('Failed to create maintenance request:', error)
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
          New Maintenance Request
        </h2>
      </div>

      <Card>
        <MaintenanceForm
          submitLabel="Create Request"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          units={units}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
