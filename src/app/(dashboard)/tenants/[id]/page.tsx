import Link from 'next/link'
import { ArrowLeft, Pencil, FileText, Building2, Mail, Phone } from 'lucide-react'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { apiRequest } from '@/lib/api-client'
import type { TenantOut, LeaseOut, PaymentOut, MaintenanceRequestOut } from '@/lib/api-types'

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value ?? null
  const tenant = await apiRequest<TenantOut>(`/api/tenants/${id}`, { token })
  const allLeases = await apiRequest<LeaseOut[]>('/api/leases', { token })
  const activeLeaseRaw = allLeases.find((l) => l.tenant_id === id && l.status === 'ACTIVE')
  const activeLease = activeLeaseRaw
    ? {
        ...activeLeaseRaw,
        unit_number: activeLeaseRaw.unit_id,
        monthlyRent: activeLeaseRaw.monthly_rent,
      }
    : null
  const allPayments = await apiRequest<PaymentOut[]>('/api/payments', { token })
  const payments = allPayments
    .filter((p) => p.lease_id === activeLeaseRaw?.id)
    .map((p) => ({
      ...p,
      paymentMethod: p.payment_method,
    }))
  const allMaintenance = await apiRequest<MaintenanceRequestOut[]>('/api/maintenance', { token })
  const maintenanceRequests = allMaintenance
    .filter((m) => m.tenant_id === id)
    .map((m) => ({
      ...m,
      createdAt: m.created_at,
    }))

  const formatPeso = (amount: number) => {
    return new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tenants">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tenant.first_name} {tenant.last_name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tenant since {formatDate(tenant.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/tenants/${tenant.id}/edit`}>
            <Button size="sm">
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          {activeLease && (
            <Link href={`/leases/${activeLease.id}`}>
              <Button size="sm" variant="outline">
                <FileText className="w-4 h-4 mr-1" />
                View Lease
              </Button>
            </Link>
          )}
          {tenant.unit_id && (
            <Link href={`/units/${tenant.unit_id}`}>
              <Button size="sm" variant="outline">
                <Building2 className="w-4 h-4 mr-1" />
                View Unit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card title="Profile">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <a
              href={`mailto:${tenant.email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              <Mail className="w-4 h-4 inline mr-1" />
              {tenant.email}
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            {tenant.phone ? (
              <a
                href={`tel:${tenant.phone}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Phone className="w-4 h-4 inline mr-1" />
                {tenant.phone}
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
          {tenant.emergency_contact && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Emergency Contact
              </p>
              <p className="text-gray-900 dark:text-white">
                {tenant.emergency_contact}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Active Lease */}
      <Card title="Active Lease">
        {activeLease ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {activeLease.unit_number}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rent</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatPeso(activeLease.monthlyRent)}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lease Period
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(activeLease.start_date)} —{' '}
                {formatDate(activeLease.end_date)}
              </p>
            </div>
            <div className="md:col-span-3">
              <Badge variant="success">{activeLease.status}</Badge>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No active lease
          </p>
        )}
      </Card>

      {/* Maintenance Requests */}
      {tenant.unit_id && (
        <Card
          title="Maintenance Requests"
          subtitle={`${maintenanceRequests.length} request${maintenanceRequests.length !== 1 ? 's' : ''}`}
        >
          {maintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {maintenanceRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/maintenance/${req.id}/edit`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-sm transition-shadow"
                >
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
                  <Badge
                    variant={
                      req.status === 'completed'
                        ? 'success'
                        : req.status === 'in_progress'
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {req.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No maintenance requests
            </p>
          )}
        </Card>
      )}

      {/* Payment History */}
      <Card
        title="Payment History"
        subtitle={`Last 10 payments • Total paid: ${formatPeso(totalPaid)}`}
      >
        {payments.length > 0 ? (
          <Table
            columns={[
              {
                key: 'date',
                label: 'Date',
                render: (_value, item: (typeof payments)[0]) =>
                  formatDate(item.date),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (_value, item: (typeof payments)[0]) =>
                  formatPeso(item.amount),
              },
              {
                key: 'status',
                label: 'Status',
                render: (_value, item: (typeof payments)[0]) => (
                  <Badge
                    variant={
                      item.status === 'paid'
                        ? 'success'
                        : item.status === 'pending'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {item.status}
                  </Badge>
                ),
              },
              {
                key: 'paymentMethod',
                label: 'Method',
                render: (_value, item: (typeof payments)[0]) =>
                  item.paymentMethod || '—',
              },
            ]}
            data={payments.slice(0, 10)}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No payments recorded
          </p>
        )}
      </Card>
    </div>
  )
}
