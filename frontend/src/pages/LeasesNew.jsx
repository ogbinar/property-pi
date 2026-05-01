import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LeaseForm } from '../components/leases/LeaseForm.jsx'
import { apiRequest } from '../api.js'

export default function LeasesNewPage() {
  const navigate = useNavigate()
  const [units, setUnits] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest('/api/units').then(setUnits).catch(() => {}),
      apiRequest('/api/tenants').then(setTenants).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Lease</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <LeaseForm
          defaultValues={{ startDate: new Date().toISOString().split('T')[0] }}
          submitLabel="Create Lease"
          isLoading={loading}
          units={units}
          tenants={tenants}
          onSubmit={async (data) => {
            try {
              await apiRequest('/api/leases', {
                method: 'POST',
                body: JSON.stringify({
                  tenant_id: data.tenantId,
                  unit_id: data.unitId,
                  monthly_rent: Number(data.monthlyRent),
                  start_date: data.startDate,
                  end_date: data.endDate,
                }),
              })
              toast.success('Lease created successfully')
              navigate('/leases')
            } catch (error) {
              toast.error(error.message || 'Failed to create lease')
            }
          }}
          onCancel={() => navigate('/leases')}
        />
      </div>
    </div>
  )
}
