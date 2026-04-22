import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react'

interface Expiration {
  unitNumber: string
  tenantName: string
  endDate: string
  daysRemaining: number
  urgency: 'critical' | 'warning' | 'upcoming'
}

interface ExpirationsCardProps {
  expirations: Expiration[]
}

const urgencyConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  critical: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    label: 'Critical',
  },
  warning: {
    icon: <Clock className="w-4 h-4" />,
    bg: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Warning',
  },
  upcoming: {
    icon: <Calendar className="w-4 h-4" />,
    bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
    label: 'Upcoming',
  },
}

export function ExpirationsCard({ expirations }: ExpirationsCardProps) {
  if (expirations.length === 0) {
    return (
      <Card
        title="Upcoming Expirations"
        subtitle="Next 60 days"
        action={
          <Link href="/leases">
            <Button size="sm" variant="outline">
              View All
            </Button>
          </Link>
        }
      >
        <EmptyState
          title="No leases expiring"
          description="No leases are expiring in the next 60 days."
        />
      </Card>
    )
  }

  return (
    <Card
      title="Upcoming Expirations"
      subtitle="Next 60 days"
      action={
        <Link href="/leases">
          <Button size="sm" variant="outline">
            View All
          </Button>
        </Link>
      }
    >
      <div className="space-y-3">
        {expirations.map((exp, index) => {
          const config = urgencyConfig[exp.urgency]
          const endDate = new Date(exp.endDate)
          const formattedDate = endDate.toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <div
              key={index}
              className={`rounded-lg border p-3 ${config.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${config.text}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Unit {exp.unitNumber} — {exp.tenantName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Ends {formattedDate}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-lg font-bold ${config.text}`}>
                    {exp.daysRemaining}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    days left
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
