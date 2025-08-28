// src/components/ui/PermissionsTableSkeleton.jsx
import React from 'react';

const PermissionsTableSkeleton = () => {
  return (
    <div className="p-4 md:p-8 bg-white rounded-xl shadow-lg w-full animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="h-8 bg-gray-200 rounded-md w-64"></div>
        <div className="h-10 bg-gray-200 rounded-md w-32"></div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="table table-auto w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left w-1/2">Page</th>
              <th className="py-3 px-4 text-left">Access</th>
              <th className="py-3 px-4 text-left w-1/2">Permissions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {/* Generate 5 skeleton rows */}
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    <div className="h-4 bg-gray-200 rounded-md w-16"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-12"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-20"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsTableSkeleton;