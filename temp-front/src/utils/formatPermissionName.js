// src/utils/formatPermissionName.js
/**
 * @fileoverview A utility function to translate technical permission names into user-friendly labels.
 * This function improves the readability of the UI for non-technical users.
 */

/**
 * Maps a technical permission name to a more readable label.
 * @param {string} permissionName The raw permission name (e.g., 'users.index').
 * @returns {string} The user-friendly label (e.g., 'View All').
 */
export const formatPermissionName = (permissionName) => {
  if (!permissionName || typeof permissionName !== 'string') {
    return 'N/A';
  }

  // Split the name to get the action (e.g., 'index', 'store').
  const parts = permissionName.split('.');
  const action = parts[parts.length - 1];

  switch (action) {
    case 'index':
      return 'View All';
    case 'show':
      return 'View'; // Changed from 'Selective View' for better readability
    case 'edit':
      return 'Edit';
    case 'update':
      return 'Update';
    case 'store':
      return 'Create';
    case 'destroy':
      return 'Delete';
    default:
      // Capitalize the first letter for other cases
      return action.charAt(0).toUpperCase() + action.slice(1);
  }
};
