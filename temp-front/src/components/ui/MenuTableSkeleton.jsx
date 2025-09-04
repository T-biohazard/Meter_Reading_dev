import React from 'react';

const MenuTableSkeleton = () => {
  const rows = Array.from({ length: 6 });

  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center pb-16">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="table table-auto w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left w-1/2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </th>
                <th className="py-3 px-4 text-left w-1/4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </th>
                <th className="py-3 px-4 text-left w-1/4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {rows.map((_, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MenuTableSkeleton;