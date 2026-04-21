interface Column<T> {
  key: keyof T
  label: string
  render?: (value: T[keyof T], item: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  actions?: (item: T) => React.ReactNode
}

export function Table<T extends { id: string }>({
  columns,
  data,
  actions,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-6 py-3">
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr
              key={String(item.id)}
              className={`bg-white dark:bg-gray-800 ${
                index % 2 === 0 ? '' : 'bg-gray-50 dark:bg-gray-750'
              }`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4">
                  {col.render
                    ? col.render(item[col.key], item)
                    : String((item as unknown as Record<string, unknown>)[String(col.key)] ?? '')}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4">{actions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
