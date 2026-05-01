import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  ArrowLeft,
  Edit,
  Plus,
  User,
  FileText,
  CreditCard,
  Calendar,
  Wrench,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { apiRequest } from '@/lib/api-client'
import type { UnitOut, ExpenseOut, MaintenanceRequestOut } from '@/lib/api-types'

interface UnitData {
  id: string
  unitNumber: string
  type: string
  status: string
  rentAmount: string
  securityDeposit: string
  createdAt: string
  updatedAt: string
  currentTenant: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    lease: {
      startDate: string
      endDate: string
      rentAmount: string
      status: string
    } | null
  } | null
  activeLease: {
    id: string
    startDate: string
    endDate: string
    rentAmount: string
    status: string
    tenant: { firstName: string; lastName: string } | null
  } | null
  recentPayments: {
    id: string
    amount: string
    date: string
    status: string
    method: string
  }[]
  recentMaintenance: {
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }[]
  recentExpenses: {
    id: string
    amount: string
    category: string
    description: string
    date: string
  }[]
}

const statusColors: Record<string, string> = {
  OCCUPIED: 'success',
  VACANT: 'neutral',
  MAINTENANCE: 'warning',
  UNDER_RENOVATION: 'info',
}

export default async function UnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? null
  const unitData = await apiRequest<UnitOut>(`/api/units/${id}`, { token })

  const [maintenance, expenses] = await Promise.all([
    apiRequest<MaintenanceRequestOut[]>('/api/maintenance', { token }),
    apiRequest<ExpenseOut[]>('/api/expenses', { token }),
  ])

  const filteredMaint = maintenance.filter((m) => m.unit_id === id)
  const filteredExpenses = expenses.filter((e) => e.unit_id === id)

  const unit: UnitData = {
    ...unitData,
    unitNumber: unitData.unit_number,
    rentAmount: String(unitData.rent_amount),
    securityDeposit: String(unitData.security_deposit),
    createdAt: unitData.created_at,
    updatedAt: unitData.created_at,
    currentTenant: null,
    activeLease: null,
    recentPayments: [],
    recentMaintenance: filteredMaint.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      priority: m.priority,
      createdAt: m.created_at,
    })),
    recentExpenses: filteredExpenses.map((e) => ({
      id: e.id,
      amount: String(e.amount),
      category: e.category,
      description: e.description,
      date: e.date,
    })),
  }

  if (!unit) {
    notFound()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  const statusVariant = (statusColors[unit.status || ''] ||
    'neutral') as 'success' | 'neutral' | 'warning' | 'info'

  const paymentStatusColors: Record<string, string> = {
    PAID: 'success',
    PENDING: 'warning',
    OVERDUE: 'error',
    PARTIAL: 'info',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <a
            href="/units"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Unit {unit.unitNumber}
              </h2>
              <Badge variant={statusVariant}>{unit.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unit.type} • {formatCurrency(unit.rentAmount)}/month
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/units/${unit.id}/edit`}>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Unit
            </Button>
          </a>
          <a href={`/leases/new?unitId=${unit.id}`}>
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Create Lease
            </Button>
          </a>
        </div>
      </div>

      {/* Unit Info */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unit Type</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {unit.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(unit.rentAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {formatCurrency(unit.securityDeposit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <Badge variant={statusVariant} className="mt-1">
              {unit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Created: {formatDate(unit.createdAt)} • Last updated: {formatDate(unit.updatedAt)}
        </div>
      </Card>

      {/* Tenant & Lease Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Tenant */}
        <Card
          title="Current Tenant"
          action={
            !unit.currentTenant && (
               <a href="/tenants/new">
                 <Button
                   size="sm"
                   variant="outline"
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Assign
                 </Button>
               </a>
             )
          }
        >
          {unit.currentTenant ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {unit.currentTenant.firstName} {unit.currentTenant.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {unit.currentTenant.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-gray-900 dark:text-white">
                    {unit.currentTenant.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">
                    {unit.currentTenant.email || '—'}
                  </p>
                </div>
              </div>
              {unit.currentTenant.lease && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Lease
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Start</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(unit.currentTenant.lease.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">End</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(unit.currentTenant.lease.endDate)}
                      </p>
                    </div>
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

        {/* Active Lease */}
        <Card
          title="Active Lease"
          action={
           !unit.activeLease && (
               <a href={`/leases/new?unitId=${unit.id}`}>
                 <Button
                   size="sm"
                   variant="outline"
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Create
                 </Button>
               </a>
             )
          }
        >
          {unit.activeLease ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Lease #{unit.activeLease.id.slice(0, 8)}
                </span>
                <Badge variant="success">{unit.activeLease.status}</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDate(unit.activeLease.startDate)} —{' '}
                    {formatDate(unit.activeLease.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(unit.activeLease.rentAmount)}/month
                  </span>
                </div>
                {unit.activeLease.tenant && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {unit.activeLease.tenant.firstName}{' '}
                      {unit.activeLease.tenant.lastName}
                    </span>
                  </div>
                )}
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

      {/* Recent Maintenance */}
      <Card
        title="Recent Maintenance"
        action={
          <a href={`/maintenance/new?unitId=${unit.id}`}>
            <Button
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Request
            </Button>
          </a>
        }
      >
        {unit.recentMaintenance.length > 0 ? (
          <div className="space-y-3">
            {unit.recentMaintenance.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {req.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    req.status === 'COMPLETED'
                      ? 'success'
                      : req.status === 'IN_PROGRESS'
                        ? 'warning'
                        : 'info'
                  }
                >
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

      {/* Recent Expenses */}
      <Card
        title="Recent Expenses"
        action={
          <a href={`/expenses/new?unitId=${unit.id}`}>
            <Button
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Expense
            </Button>
          </a>
        }
      >
        {unit.recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {unit.recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {expense.category} • {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(expense.amount)}
                </p>
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

      {/* Recent Payments */}
      <Card
        title="Recent Payments"
        action={
          <a href={`/rent?unitId=${unit.id}`}>
            <Button
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Payment
            </Button>
          </a>
        }
      >
        {unit.recentPayments.length > 0 ? (
          <div className="space-y-3">
            {unit.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(payment.date)} • {payment.method}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    (paymentStatusColors[payment.status] || 'neutral') as
                      | 'success'
                      | 'warning'
                      | 'error'
                      | 'info'
                      | 'neutral'
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No payments yet"
            description="No payment history for this unit."
            icon={<CreditCard className="w-6 h-6 text-gray-400" />}
          />
        )}
      </Card>
    </div>
  )
}
