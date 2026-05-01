import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { apiRequest } from '../api.js'
import { TenantCard } from '../components/tenants/TenantCard.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function TenantsPage() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiRequest('/api/tenants')
      .then(setTenants)
      .catch((err) => console.error('Failed to fetch tenants:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredTenants = search
    ? tenants.filter((t) => {
        const q = search.toLowerCase()
        return t.first_name.toLowerCase().includes(q) ||
          t.last_name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      })
    : tenants

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
        <Link to="/tenants/new">
          <Button variant="primary"><Plus className="w-4 h-4 mr-1" />Add Tenant</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}</div>
      ) : filteredTenants.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          {search ? 'No matching tenants' : 'No tenants found.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filteredTenants.map((tenant) => <TenantCard key={tenant.id} tenant={tenant} />)}
        </div>
      )}
    </div>
  )
}
