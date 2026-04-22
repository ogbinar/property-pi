'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, FileText, Building2, Mail, Phone, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { getTenant, getMaintenance } from '@/lib/api'

interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  emergencyContact: string | null
  createdAt: string
  unit: { id: string; unitNumber: string } | null
  leases: Array<{
    id: string
    startDate: string
    endDate: string
    rentAmount: number
    status: string
    unit: { unitNumber: string }
  }>
  payments: Array<{
    id: string
    amount: number
    date: string
    status: string
    method: string | null
  }>
  maintenanceRequests: Array<{
    id: string
    title: string
    status: string
    priority: string
    createdAt: string
  }>
}

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTenant() {
      try {
        const { id } = await params
        const data = await getTenant(id)
        // Fetch maintenance requests for the tenant's unit
        let maintenanceRequests: Array<{
          id: string
          title: string
          status: string
          priority: string
          createdAt: string
        }> = []
        if (data.unit_id) {
          const maint = await getMaintenance({ unit_id: data.unit_id })
          maintenanceRequests = maint.map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status,
            priority: m.priority,
            createdAt: m.created_at,
          }))
        }
        setTenant({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || null,
          emergencyContact: data.emergency_contact || null,
          createdAt: data.created_at,
          unit: data.unit_id ? { id: data.unit_id, unitNumber: '' } : null,
          leases: [],
          payments: [],
          maintenanceRequests,
        })
      } catch (error) {
        console.error('Failed to load tenant:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTenant()
  }, [params])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Tenant not found
        </h2>
        <Link href="/tenants">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tenants
          </Button>
        </Link>
      </div>
    )
  }

  const activeLease = tenant.leases.find((l) => l.status === 'ACTIVE')
  const totalPaid = tenant.payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)

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
              {tenant.firstName} {tenant.lastName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tenant since {formatDate(tenant.createdAt)}
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
          {tenant.unit && (
            <Link href={`/units/${tenant.unit.id}`}>
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
          {tenant.emergencyContact && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Emergency Contact
              </p>
              <p className="text-gray-900 dark:text-white">
                {tenant.emergencyContact}
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
                {activeLease.unit.unitNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rent</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatPeso(activeLease.rentAmount)}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lease Period
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(activeLease.startDate)} —{' '}
                {formatDate(activeLease.endDate)}
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
      {tenant.unit && (
        <Card
          title="Maintenance Requests"
          subtitle={`${tenant.maintenanceRequests.length} request${tenant.maintenanceRequests.length !== 1 ? 's' : ''}`}
        >
          {tenant.maintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {tenant.maintenanceRequests.map((req) => (
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
                      req.status === 'COMPLETED'
                        ? 'success'
                        : req.status === 'IN_PROGRESS'
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
        {tenant.payments.length > 0 ? (
          <Table
            columns={[
              {
                key: 'date',
                label: 'Date',
                render: (_value, item: (typeof tenant.payments)[0]) =>
                  formatDate(item.date),
              },
              {
                key: 'amount',
                label: 'Amount',
                render: (_value, item: (typeof tenant.payments)[0]) =>
                  formatPeso(item.amount),
              },
              {
                key: 'status',
                label: 'Status',
                render: (_value, item: (typeof tenant.payments)[0]) => (
                  <Badge
                    variant={
                      item.status === 'PAID'
                        ? 'success'
                        : item.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {item.status}
                  </Badge>
                ),
              },
              {
                key: 'method',
                label: 'Method',
                render: (_value, item: (typeof tenant.payments)[0]) =>
                  item.method || '—',
              },
            ]}
            data={tenant.payments}
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
