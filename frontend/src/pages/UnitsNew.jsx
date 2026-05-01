import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UnitForm } from '../components/units/UnitForm.jsx'
import { apiRequest } from '../api.js'

export default function NewUnitPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data) {
    setLoading(true)
    try {
      await apiRequest('/api/units', {
        method: 'POST',
        body: {
          unit_number: data.unitNumber,
          type: data.type,
          rent_amount: Number(data.rentAmount),
          security_deposit: Number(data.securityDeposit),
        },
      })
      navigate('/units')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <a href="/units" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 inline-block">← Back to Units</a>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Unit</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new rental unit for your property.</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <UnitForm submitLabel="Create Unit" onSubmit={handleSubmit} isLoading={loading} onCancel={() => navigate('/units')} />
      </div>
    </div>
  )
}
