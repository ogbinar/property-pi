import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge.jsx'
import { Card } from '../ui/Card.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Button } from '../ui/Button.jsx'

const statusColors = {
  PAID: 'success',
  OVERDUE: 'error',
  PENDING: 'warning',
}

function formatPHP(amount) {
  return new Intl.NumberFormat('fil-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fil-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function RentCollectionTable({ records, onMarkPaid, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2m0 0l5-5M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v9a2 2 0 002 2z" />
          </svg>
        }
        title="No rent records found"
        description="Generate rent for this month to see records here."
        actionLabel="Generate Rent"
        onAction={() => {
          const generateBtn = document.getElementById('generate-rent-btn')
          generateBtn?.click()
        }}
      />
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Unit
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Tenant
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                Due Date
              </th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((record) => (
              <tr
                key={record.id}
                className={`hover:bg-gray-50 transition-colors ${
                  record.status === 'OVERDUE' ? 'bg-red-50/50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Unit {record.unitNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {record.tenant}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {formatPHP(record.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(record.dueDate)}
                </td>
                <td className="px-4 py-3 text-center">
                  {record.status === 'PAID' ? (
                    <Badge variant="success">Paid</Badge>
                  ) : record.status === 'OVERDUE' ? (
                    <Badge variant="error">
                      Overdue ({record.daysOverdue}d)
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      {record.daysUntilDue > 0
                        ? `Due in ${record.daysUntilDue}d`
                        : 'Due today'}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {record.status !== 'PAID' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onMarkPaid(record.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
