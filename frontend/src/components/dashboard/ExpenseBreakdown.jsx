import { Card } from '../ui/Card.jsx'

export function ExpenseBreakdown({ total, netProfit, categoryBreakdown }) {
  const totalNum = parseFloat(total)
  const profitNum = parseFloat(netProfit)
  const isProfit = profitNum >= 0

  const colors = Object.keys(categoryBreakdown)
  const colorPalette = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500']

  return (
    <Card title="Expense Breakdown">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Profit (this month)</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isProfit ? '' : '('}{new Intl.NumberFormat('fil-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(profitNum))}{isProfit ? '' : ' Loss)'}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-lg font-medium text-red-600 dark:text-red-400">
            {new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(totalNum)}
          </p>
        </div>
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, amount], index) => {
              const percentage = totalNum > 0 ? (amount / totalNum) * 100 : 0
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Intl.NumberFormat('fil-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({Math.round(percentage)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div className={`h-1.5 rounded-full ${colorPalette[index % colorPalette.length]}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {Object.keys(categoryBreakdown).length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No expenses recorded this month</p>
        )}
      </div>
    </Card>
  )
}
