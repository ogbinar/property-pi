import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wrench } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { Button } from '../components/ui/Button.jsx'
import { apiRequest } from '../api.js'

const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
}

export default function MaintenanceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/api/maintenance/${id}`)
      .then(setItem)
      .catch((err) => console.error('Failed to load maintenance:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!item) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Maintenance request not found</div>

  const statusVariant = statusColors[item.status] || 'neutral'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/maintenance" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.title}</h2>
              <Badge variant={statusVariant}>{item.status}</Badge>
            </div>
            {item.priority && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Priority: {item.priority}</p>
            )}
          </div>
        </div>
        <Link to={`/maintenance/${item.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>

      <Card title="Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <Badge variant={statusVariant}>{item.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
            <p className="text-gray-900 dark:text-white">{item.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {item.unit_id && (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
              <Link to={`/units/${item.unit_id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{item.unit_id.slice(0, 8)}</Link>
            </div>
          )}
        </div>
        {item.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{item.description}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
