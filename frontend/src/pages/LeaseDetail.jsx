import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, CreditCard } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { apiRequest } from '../api.js'

const statusColors = {
  ACTIVE: 'success',
  EXPIRED: 'neutral',
  TERMINATED: 'error',
  RENEWAL_PENDING: 'warning',
}

export default function LeaseDetailPage() {
  const { id } = useParams()
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/api/leases/${id}`)
      .then(setLease)
      .catch((err) => console.error('Failed to load lease:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!lease) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Lease not found</div>

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const statusVariant = statusColors[lease.status] || 'neutral'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/leases" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lease</h2>
            <Badge variant={statusVariant}>{lease.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
          </p>
        </div>
      </div>

      <Card title="Lease Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(lease.monthly_rent)}/month</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
            <p className="text-gray-900 dark:text-white">
              {lease.unit_number ? (
                <Link to={`/units/${lease.unit_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{lease.unit_number}</Link>
              ) : lease.unit_id ? lease.unit_id.slice(0, 8) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tenant</p>
            <p className="text-gray-900 dark:text-white">
              {lease.tenant_name ? (
                <Link to={`/tenants/${lease.tenant_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{lease.tenant_name}</Link>
              ) : lease.tenant_id ? lease.tenant_id.slice(0, 8) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-gray-900 dark:text-white">{formatDate(lease.created_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
