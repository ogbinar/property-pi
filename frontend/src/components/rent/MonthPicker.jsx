import { useState } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthPicker({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const currentMonth = MONTHS[value.getMonth()]
  const currentYear = value.getFullYear()

  const handleSelectMonth = (monthIndex) => {
    const newDate = new Date(value.getFullYear(), monthIndex, 1)
    onChange(newDate)
    setShowPicker(false)
  }

  const handleYearChange = (delta) => {
    const newDate = new Date(value.getFullYear() + delta, value.getMonth(), 1)
    onChange(newDate)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-900">
          {currentMonth} {currentYear}
        </span>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l3-3m0 0l3 3m-3-3v18" />
        </svg>
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => handleYearChange(-1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-900">
                {currentYear}
              </span>
              <button
                onClick={() => handleYearChange(1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleSelectMonth(index)}
                  className={`px-2 py-1.5 text-sm rounded-md transition-colors ${
                    index === value.getMonth()
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
