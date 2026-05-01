import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Building2, Mail, Phone, FileText } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Button } from '../components/ui/Button.jsx'
import { apiRequest } from '../api.js'

export default function TenantDetailPage() {
  const { id } = useParams()
  const [tenant, setTenant] = useState(null)
  const [payments, setPayments] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/tenants/${id}`),
      apiRequest('/api/payments').catch(() => []),
      apiRequest('/api/maintenance').catch(() => []),
    ]).then(([tenantData, paymentsData, maintenanceData]) => {
      setTenant(tenantData)
      setPayments(paymentsData || [])
      setMaintenance(maintenanceData || [])
      setLoading(false)
    }).catch((err) => {
      console.error('Failed to load tenant:', err)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!tenant) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Tenant not found</div>

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const activeLease = tenant.lease || null
  const tenantPayments = activeLease
    ? payments.filter((p) => p.lease_id === activeLease.id)
    : []
  const totalPaid = tenantPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)
  const tenantMaintenance = maintenance.filter((m) => m.tenant_id === id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/tenants" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.first_name} {tenant.last_name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tenant since {formatDate(tenant.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/tenants/${tenant.id}/edit`}>
            <Button size="sm"><Pencil className="w-4 h-4 mr-1" />Edit</Button>
          </Link>
          {activeLease && (
            <Link to={`/leases/${activeLease.id}`}>
              <Button size="sm" variant="outline"><FileText className="w-4 h-4 mr-1" />View Lease</Button>
            </Link>
          )}
          {tenant.unit_id && (
            <Link to={`/units/${tenant.unit_id}`}>
              <Button size="sm" variant="outline"><Building2 className="w-4 h-4 mr-1" />View Unit</Button>
            </Link>
          )}
        </div>
      </div>

      <Card title="Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <a href={`mailto:${tenant.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
              <Mail className="w-4 h-4 inline mr-1" />
              {tenant.email}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            {tenant.phone ? (
              <a href={`tel:${tenant.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                <Phone className="w-4 h-4 inline mr-1" />
                {tenant.phone}
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
          {tenant.emergency_contact && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
              <p className="text-gray-900 dark:text-white">{tenant.emergency_contact}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Active Lease">
        {activeLease ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {activeLease.unit_number || activeLease.unit_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rent</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(activeLease.monthly_rent)}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lease Period</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(activeLease.start_date)} - {formatDate(activeLease.end_date)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No active lease</p>
        )}
      </Card>

      {tenant.unit_id && tenantMaintenance.length > 0 && (
        <Card title="Maintenance Requests" subtitle={`${tenantMaintenance.length} request${tenantMaintenance.length !== 1 ? 's' : ''}`}>
          <div className="space-y-3">
            {tenantMaintenance.map((req) => (
              <Link
                key={req.id}
                to={`/maintenance/${req.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{req.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(req.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'IN_PROGRESS' ? 'warning' : 'info'}>
                  {req.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <Card title="Payment History" subtitle={`Total paid: ${formatCurrency(totalPaid)}`}>
        {tenantPayments.length > 0 ? (
          <div className="space-y-3">
            {tenantPayments.slice(0, 10).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(payment.date)}</p>
                  <Badge variant={payment.status === 'PAID' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'error'}>
                    {payment.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payments recorded</p>
        )}
      </Card>
    </div>
  )
}
