import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { apiRequest } from '../api.js'
import { MaintenanceCard } from '../components/maintenance/MaintenanceCard.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    apiRequest('/api/maintenance')
      .then(setMaintenance)
      .catch((err) => console.error('Failed to fetch maintenance:', err))
      .finally(() => setLoading(false))
  }, [])

  const statuses = [...new Set(maintenance.map((m) => m.status))]
  const filteredMaintenance = maintenance.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h2>
        <Link to="/maintenance/new">
          <Button><Plus className="w-4 h-4 mr-2" />New Request</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search maintenance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}</div>
      ) : filteredMaintenance.length > 0 ? (
        <div className="space-y-2">{filteredMaintenance.map((item) => <MaintenanceCard key={item.id} maintenance={item} />)}</div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {search || statusFilter ? 'No matching maintenance requests' : 'No maintenance requests yet.'}
        </p>
      )}
    </div>
  )
}
