import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { TenantForm } from '../components/tenants/TenantForm.jsx'
import { TenantDeleteClient } from '../components/tenants/TenantDeleteClient.jsx'
import { apiRequest } from '../api.js'

export default function TenantEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/api/tenants/${id}`)
      .then(setTenant)
      .catch((err) => console.error('Failed to load tenant:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!tenant) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Tenant not found</div>

  return (
    <div className="max-w-2xl">
      <Link to="/tenants" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Tenants
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Tenant</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update tenant information.</p>
        </div>
        <TenantDeleteClient id={tenant.id} name={`${tenant.first_name} ${tenant.last_name}`} />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <TenantForm
          defaultValues={{
            firstName: tenant.first_name,
            lastName: tenant.last_name,
            email: tenant.email,
            phone: tenant.phone || '',
            emergencyContact: tenant.emergency_contact || '',
            unitId: tenant.unit_id || '',
          }}
          submitLabel="Update Tenant"
          onSubmit={async (data) => {
            try {
              await apiRequest(`/api/tenants/${tenant.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  first_name: data.firstName,
                  last_name: data.lastName,
                  email: data.email,
                  phone: data.phone || null,
                  emergency_contact: data.emergencyContact || null,
                  unit_id: data.unitId || null,
                }),
              })
              toast.success('Tenant updated successfully')
              navigate('/tenants')
            } catch (error) {
              toast.error(error.message || 'Failed to update tenant')
            }
          }}
          onCancel={() => navigate('/tenants')}
        />
      </div>
    </div>
  )
}
