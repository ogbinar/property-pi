import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MaintenanceForm } from '@/components/maintenance/maintenance-form'
import { getMaintenanceRequestAction, updateMaintenanceAction } from '@/app/actions/maintenance-actions'

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'

type RequestData = {
  id: string
  title: string
  description: string
  priority: Priority
  unitId: string
  cost: string
}

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let request: RequestData
  try {
    const data = await getMaintenanceRequestAction(id)
    const mappedPriority: Priority = data.priority === 'URGENT' ? 'EMERGENCY' : (data.priority as Priority)
    request = {
      id,
      title: data.title,
      description: data.description,
      priority: mappedPriority,
      unitId: data.unit_id || '',
      cost: data.cost !== null ? String(data.cost) : '',
    }
  } catch {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance request not found</h2>
        <Link href="/maintenance"><Button variant="outline" className="mt-4">Back to Maintenance</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/maintenance"><Button variant="outline">← Back</Button></Link>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Maintenance Request
        </h2>
      </div>

      <Card>
        <MaintenanceForm
          defaultValues={request}
          submitLabel="Update Request"
          onSubmit={async (data) => {
            await updateMaintenanceAction(request.id, {
              title: data.title,
              description: data.description,
              priority: data.priority === 'EMERGENCY' ? 'URGENT' : data.priority,
              cost: data.cost ? Number(data.cost) : undefined,
            })
            window.location.href = '/maintenance'
          }}
          isLoading={false}
          units={[]}
          onCancel={() => window.location.href = '/maintenance'}
        />
      </Card>
    </div>
  )
}
