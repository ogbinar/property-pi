import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { getUnitsAction } from '@/app/actions/unit-actions'
import type { UnitOut } from '@/lib/api-types'

interface UnitItem extends UnitOut {}

const statusColors: Record<string, { bg: string; border: string; badge: 'success' | 'neutral' | 'warning' | 'info' }> = {
  OCCUPIED: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800',
    badge: 'success',
  },
  VACANT: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    badge: 'neutral',
  },
  MAINTENANCE: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'warning',
  },
  UNDER_RENOVATION: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'info',
  },
}

function UnitGridSkeleton() {
  return (
    <Card title="Unit Status Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </Card>
  )
}

async function UnitGridContent({ units }: { units: UnitItem[] }) {
  if (units.length === 0) {
    return (
      <Card
        title="Unit Status Overview"
        action={
          <Link href="/units/new">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Unit
            </Button>
          </Link>
        }
      >
        <EmptyState
          title="No units configured"
          description="Add your first unit to get started."
          actionLabel="Add Unit"
          onAction={() => (window.location.href = '/units/new')}
        />
      </Card>
    )
  }

  return (
    <Card title="Unit Status Overview">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {units.slice(0, 5).map((unit) => {
          const colors = statusColors[unit.status] || statusColors.VACANT
          return (
            <Link
              key={unit.id}
              href={`/units/${unit.id}`}
              className={`rounded-lg border p-3 transition-colors hover:shadow-md ${colors.bg} ${colors.border}`}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {unit.unit_number}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {unit.type}
                </p>
                <Badge variant={colors.badge} className="mt-2">
                  {unit.status.replace('_', ' ')}
                </Badge>
              </div>
            </Link>
          )
        })}
        {units.length > 5 && (
          <Link
            href="/units"
            className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors"
          >
            View all {units.length} units
          </Link>
        )}
      </div>
    </Card>
  )
}

export async function UnitStatusGrid() {
  let units: UnitItem[] = []
  try {
    units = await getUnitsAction()
  } catch (error) {
    console.error('Failed to fetch units:', error)
  }

  if (units.length === 0) {
    return <UnitGridSkeleton />
  }

  return <UnitGridContent units={units} />
}
