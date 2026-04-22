import { Card } from '@/components/ui/card'

interface ExpenseBreakdownCardProps {
  collected: string
  expenses: string
  netProfit: string
}

export function ExpenseBreakdownCard({ collected, expenses, netProfit }: ExpenseBreakdownCardProps) {
  const collectedNum = parseFloat(collected)
  const expensesNum = parseFloat(expenses)
  const netProfitNum = parseFloat(netProfit)

  const formatPeso = (amount: number) => {
    return new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isProfit = netProfitNum >= 0

  return (
    <Card title="Net Profit">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPeso(collectedNum)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatPeso(expensesNum)}
            </p>
          </div>
        </div>

        {/* Net profit highlight */}
        <div className={`rounded-lg p-4 ${isProfit ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit</p>
          <p className={`text-3xl font-bold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPeso(netProfitNum)}
          </p>
        </div>
      </div>
    </Card>
  )
}
