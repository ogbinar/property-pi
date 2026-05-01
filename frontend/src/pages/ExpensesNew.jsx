import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ExpenseForm } from '../components/expenses/ExpenseForm.jsx'
import { apiRequest } from '../api.js'

export default function ExpensesNewPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/api/units').catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">New Expense</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ExpenseForm
          submitLabel="Create Expense"
          isLoading={loading}
          onSubmit={async (data) => {
            try {
              await apiRequest('/api/expenses', {
                method: 'POST',
                body: JSON.stringify({
                  amount: Number(data.amount),
                  category: data.category,
                  description: data.description,
                  date: data.date,
                  unit_id: data.unitId || null,
                }),
              })
              toast.success('Expense created successfully')
              navigate('/expenses')
            } catch (error) {
              toast.error(error.message || 'Failed to create expense')
            }
          }}
          onCancel={() => navigate('/expenses')}
        />
      </div>
    </div>
  )
}
