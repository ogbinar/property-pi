import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TenantForm } from '../components/tenants/TenantForm.jsx'

export default function TenantsNewPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Tenant</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <TenantForm
          submitLabel="Add Tenant"
          onSubmit={async (data) => {
            try {
              await fetch('/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  first_name: data.first_name,
                  last_name: data.last_name,
                  email: data.email,
                  phone: data.phone || null,
                  emergency_contact: data.emergency_contact || null,
                  unit_id: data.unit_id || null,
                }),
              })
              toast.success('Tenant added successfully')
              navigate('/tenants')
            } catch (error) {
              toast.error(error.message || 'Failed to add tenant')
            }
          }}
          onCancel={() => navigate('/tenants')}
        />
      </div>
    </div>
  )
}
