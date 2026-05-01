import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { apiRequest } from '../api.js'
import { LeaseCard } from '../components/leases/LeaseCard.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function LeasesPage() {
  const [leases, setLeases] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiRequest('/api/leases')
      .then(setLeases)
      .catch((err) => console.error('Failed to fetch leases:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredLeases = search
    ? leases.filter((l) => {
        const q = search.toLowerCase()
        return (l.tenant_name || '').toLowerCase().includes(q) ||
          (l.unit_number || '').toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q)
      })
    : leases

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leases</h2>
        <Link to="/leases/new">
          <Button><Plus className="w-4 h-4 mr-2" />New Lease</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search leases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}</div>
      ) : filteredLeases.length > 0 ? (
        <div className="space-y-2">{filteredLeases.map((lease) => <LeaseCard key={lease.id} lease={lease} />)}</div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {search ? 'No matching leases' : 'No leases yet.'}
        </p>
      )}
    </div>
  )
}
