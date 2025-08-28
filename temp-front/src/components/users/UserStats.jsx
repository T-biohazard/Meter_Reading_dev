import React from 'react';
import { FaUsers, FaUserShield, FaUser } from 'react-icons/fa';

/**
 * Renders a set of summary cards for user statistics.
 * @param {object} props - Component props.
 * @param {Array} props.users - The array of user objects.
 */
const UserStats = ({ users }) => {
  // Calculate statistics from the user data
  const totalUsers = users.length;
  const adminUsers = users.filter(user =>
    user.roles.some(role => role.name === 'admin')
  ).length;
  const regularUsers = totalUsers - adminUsers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card for Total Users */}
      <div className="card bg-base-100 shadow-xl rounded-lg border border-base-300 transform transition-transform hover:scale-105">
        <div className="card-body p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary rounded-full text-white">
              <FaUsers size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{totalUsers}</h2>
              <p className="text-sm text-base-content opacity-70">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card for Admin Users */}
      <div className="card bg-base-100 shadow-xl rounded-lg border border-base-300 transform transition-transform hover:scale-105">
        <div className="card-body p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-accent rounded-full text-white">
              <FaUserShield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{adminUsers}</h2>
              <p className="text-sm text-base-content opacity-70">Admin Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card for Regular Users */}
      <div className="card bg-base-100 shadow-xl rounded-lg border border-base-300 transform transition-transform hover:scale-105">
        <div className="card-body p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-secondary rounded-full text-white">
              <FaUser size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{regularUsers}</h2>
              <p className="text-sm text-base-content opacity-70">Regular Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
