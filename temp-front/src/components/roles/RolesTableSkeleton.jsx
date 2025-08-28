// src/components/roles/RolesTableSkeleton.jsx
function RolesTableSkeleton() {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i); // Render 5 placeholder rows

  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="table w-full">
        {/* Table head skeleton */}
        <thead>
          <tr>
            <th>
              <div className="h-4 bg-base-300 rounded w-24"></div>
            </th>
            <th>
              <div className="h-4 bg-base-300 rounded w-32"></div>
            </th>
            <th className="text-right">
              <div className="h-4 bg-base-300 rounded w-20 ml-auto"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Table body skeleton */}
          {skeletonRows.map((row) => (
            <tr key={row}>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-base-300 rounded w-24"></div>
                </div>
              </td>
              <td>
                <div className="flex flex-wrap gap-2">
                  <div className="h-4 bg-base-300 rounded w-16"></div>
                  <div className="h-4 bg-base-300 rounded w-12"></div>
                  <div className="h-4 bg-base-300 rounded w-16"></div>
                </div>
              </td>
              <td className="text-right">
                <div className="join">
                  <div className="h-8 w-8 bg-base-300 rounded-lg join-item"></div>
                  <div className="h-8 w-8 bg-base-300 rounded-lg join-item ml-1"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RolesTableSkeleton;