interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 10 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-200">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-3 py-2 border-r border-gray-200">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                    {colIdx === 3 && <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
