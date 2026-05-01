import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm.jsx'
import { apiRequest } from '../api.js'

export default function MaintenanceNewPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/api/units').catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Maintenance Request</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <MaintenanceForm
          submitLabel="Create Request"
          isLoading={loading}
          onSubmit={async (data) => {
            try {
              await apiRequest('/api/maintenance', {
                method: 'POST',
                body: JSON.stringify({
                  title: data.title,
                  description: data.description,
                  priority: data.priority,
                  unit_id: data.unitId || null,
                  tenant_id: data.tenantId || null,
                }),
              })
              toast.success('Maintenance request created successfully')
              navigate('/maintenance')
            } catch (error) {
              toast.error(error.message || 'Failed to create request')
            }
          }}
          onCancel={() => navigate('/maintenance')}
        />
      </div>
    </div>
  )
}
