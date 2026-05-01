import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { UnitForm } from '../components/units/UnitForm.jsx'
import { UnitDeleteClient } from '../components/units/UnitDeleteClient.jsx'
import { apiRequest } from '../api.js'

export default function UnitEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [unit, setUnit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/api/units/${id}`)
      .then(setUnit)
      .catch((err) => console.error('Failed to load unit:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!unit) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Unit not found</div>

  return (
    <div className="max-w-2xl">
      <Link to={`/units/${unit.id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Unit {unit.unit_number}
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Unit {unit.unit_number}
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <UnitForm
          defaultValues={{
            type: unit.type,
            rentAmount: String(unit.rent_amount),
            securityDeposit: String(unit.security_deposit),
          }}
          submitLabel="Save Changes"
          onSubmit={async (data) => {
            await apiRequest(`/api/units/${unit.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                type: data.type,
                rent_amount: Number(data.rentAmount),
                security_deposit: Number(data.securityDeposit),
              }),
            })
            navigate(`/units/${unit.id}`)
          }}
          isLoading={false}
          disabledUnitNumber={true}
          onCancel={() => navigate(`/units/${unit.id}`)}
        />
      </div>

      <UnitDeleteClient unitId={unit.id} unitNumber={unit.unit_number} />
    </div>
  )
}
