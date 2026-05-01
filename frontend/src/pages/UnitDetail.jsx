import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, User, FileText, CreditCard, Calendar, Wrench, TrendingDown } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Button } from '../components/ui/Button.jsx'
import { apiRequest } from '../api.js'

const statusColors = {
  OCCUPIED: 'success', VACANT: 'neutral', MAINTENANCE: 'warning', UNDER_RENOVATION: 'info',
}

export default function UnitDetailPage() {
  const { id } = useParams()
  const [unit, setUnit] = useState(null)
  const [maintenance, setMaintenance] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/units/${id}`),
      apiRequest('/api/maintenance').catch(() => []),
      apiRequest('/api/expenses').catch(() => []),
    ]).then(([unitData, maintData, expData]) => {
      setUnit(unitData)
      setMaintenance(maintData || [])
      setExpenses(expData || [])
      setLoading(false)
    }).catch((err) => {
      console.error('Failed to load unit:', err)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!unit) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Unit not found</div>

  const filteredMaint = maintenance.filter((m) => m.unit_id === id)
  const filteredExpenses = expenses.filter((e) => e.unit_id === id)

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatCurrency = (amount) => new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(amount)
  const statusVariant = statusColors[unit.status] || 'neutral'
  const paymentStatusColors = { PAID: 'success', PENDING: 'warning', OVERDUE: 'error', PARTIAL: 'info' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/units" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unit {unit.unit_number}</h2>
              <Badge variant={statusVariant}>{unit.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{unit.type} - {formatCurrency(unit.rent_amount)}/month</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/units/${unit.id}/edit`}>
            <Button><Edit className="w-4 h-4 mr-2" />Edit Unit</Button>
          </Link>
          <Link to={`/leases/new?unitId=${unit.id}`}>
            <Button variant="secondary"><Plus className="w-4 h-4 mr-2" />Create Lease</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Unit Type</p><p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{unit.type}</p></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p><p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(unit.rent_amount)}</p></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</p><p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(unit.security_deposit)}</p></div>
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><Badge variant={statusVariant} className="mt-1">{unit.status.replace('_', ' ')}</Badge></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Created: {formatDate(unit.created_at)}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Current Tenant"
          action={
            !unit.current_tenant && (
              <Link to="/tenants/new">
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Assign</Button>
              </Link>
            )
          }
        >
          {unit.current_tenant ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {unit.current_tenant.first_name} {unit.current_tenant.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{unit.current_tenant.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500 dark:text-gray-400">Phone</p><p className="text-gray-900 dark:text-white">{unit.current_tenant.phone || '-'}</p></div>
                <div><p className="text-gray-500 dark:text-gray-400">Email</p><p className="text-gray-900 dark:text-white">{unit.current_tenant.email || '-'}</p></div>
              </div>
              {unit.current_tenant.lease && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Lease</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-gray-500 dark:text-gray-400">Start</p><p className="text-gray-900 dark:text-white">{formatDate(unit.current_tenant.lease.start_date)}</p></div>
                    <div><p className="text-gray-500 dark:text-gray-400">End</p><p className="text-gray-900 dark:text-white">{formatDate(unit.current_tenant.lease.end_date)}</p></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No tenant"
              description="This unit is currently vacant."
              actionLabel="Assign Tenant"
              href="/tenants/new"
              icon={<User className="w-6 h-6 text-gray-400" />}
            />
          )}
        </Card>

        <Card
          title="Active Lease"
          action={
            !unit.active_lease && (
              <Link to={`/leases/new?unitId=${unit.id}`}>
                <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Create</Button>
              </Link>
            )
          }
        >
          {unit.active_lease ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Lease #{unit.active_lease.id.slice(0, 8)}</span>
                <Badge variant="success">{unit.active_lease.status}</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDate(unit.active_lease.start_date)} - {formatDate(unit.active_lease.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{formatCurrency(unit.active_lease.monthly_rent)}/month</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No active lease"
              description="Create a lease to track rental terms."
              actionLabel="Create Lease"
              href={`/leases/new?unitId=${unit.id}`}
              icon={<FileText className="w-6 h-6 text-gray-400" />}
            />
          )}
        </Card>
      </div>

      <Card
        title="Recent Maintenance"
        action={
          <Link to={`/maintenance/new?unitId=${unit.id}`}>
            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />New Request</Button>
          </Link>
        }
      >
        {filteredMaint.length > 0 ? (
          <div className="space-y-3">
            {filteredMaint.map((req) => (
              <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{req.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'IN_PROGRESS' ? 'warning' : 'info'}>
                  {req.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No maintenance requests"
            description="No maintenance issues reported for this unit."
            icon={<Wrench className="w-6 h-6 text-gray-400" />}
          />
        )}
      </Card>

      <Card
        title="Recent Expenses"
        action={
          <Link to={`/expenses/new?unitId=${unit.id}`}>
            <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add Expense</Button>
          </Link>
        }
      >
        {filteredExpenses.length > 0 ? (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{expense.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{expense.category} - {formatDate(expense.date)}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No expenses yet"
            description="No expenses recorded for this unit."
            icon={<TrendingDown className="w-6 h-6 text-gray-400" />}
          />
        )}
      </Card>
    </div>
  )
}
