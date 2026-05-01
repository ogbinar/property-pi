import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { ExpenseForm } from '../components/expenses/ExpenseForm.jsx'
import { apiRequest } from '../api.js'

export default function ExpenseEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest(`/api/expenses/${id}`)
      .then(setExpense)
      .catch((err) => console.error('Failed to load expense:', err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center py-12"><div className="text-gray-500">Loading...</div></div>
  if (!expense) return <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded">Expense not found</div>

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/expenses')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Expenses
      </button>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Expense</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <ExpenseForm
          defaultValues={{
            amount: String(expense.amount),
            category: expense.category,
            description: expense.description,
            date: expense.date,
            unitId: expense.unit_id || '',
          }}
          submitLabel="Save Changes"
          onSubmit={async (data) => {
            try {
              await apiRequest(`/api/expenses/${expense.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  amount: Number(data.amount),
                  category: data.category,
                  description: data.description,
                  date: data.date,
                  unit_id: data.unitId || null,
                }),
              })
              toast.success('Expense updated successfully')
              navigate('/expenses')
            } catch (error) {
              toast.error(error.message || 'Failed to update expense')
            }
          }}
          onCancel={() => navigate('/expenses')}
        />
      </div>
    </div>
  )
}
