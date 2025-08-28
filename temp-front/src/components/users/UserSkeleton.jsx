import React from 'react';

/**
 * A skeleton loader component for the user table.
 * @param {object} props - Component props.
 * @param {number} [props.rows=5] - The number of rows to display in the skeleton.
 */
const UserSkeleton = ({ rows = 5 }) => {
  const skeletonRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <div className="overflow-x-auto shadow-xl rounded-lg animate-pulse">
      <table className="table w-full table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Team</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skeletonRows.map((_, index) => (
            <tr key={index}>
              <td>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-base-300"></div>
                  <div>
                    <div className="h-4 bg-base-300 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-base-300 rounded w-16"></div>
                  </div>
                </div>
              </td>
              <td>
                <div className="h-4 bg-base-300 rounded w-32"></div>
              </td>
              <td>
                <div className="h-4 bg-base-300 rounded w-16"></div>
              </td>
              <td>
                <div className="h-4 bg-base-300 rounded w-12"></div>
              </td>
              <td>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-base-300 rounded-lg"></div>
                  <div className="h-8 w-8 bg-base-300 rounded-lg"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserSkeleton;
