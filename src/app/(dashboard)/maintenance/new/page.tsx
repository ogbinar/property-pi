'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { MaintenanceForm, MaintenanceFormData } from '@/components/maintenance/maintenance-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import * as maintenanceActions from '@/app/actions/maintenance-actions'
import { getUnitsAction, Unit } from '@/app/actions/unit-actions'

export default function NewMaintenancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])

  useEffect(() => {
    getUnitsAction().then(setUnits).catch(console.error)
  }, [])

  const handleSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true)
    try {
      await maintenanceActions.createMaintenanceAction({
        title: data.title,
        description: data.description,
        priority: data.priority,
        unit_id: data.unitId,
      })
      toast.success('Maintenance request created successfully')
      router.push('/maintenance')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create maintenance request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
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
          units={units.map((u: Unit) => ({ id: u.id, unitNumber: u.unit_number }))}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  )
}
