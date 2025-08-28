// // src/hooks/usePermissions.js
// import { useAuth } from "../app/AuthContext";
// export function usePermissions() {
//   const { user } = useAuth();

//   /**
//    * Checks if the authenticated user has a specific permission.
//    * Assumes the user object from AuthContext includes a roles array,
//    * where each role has a permissions array.
//    * @param {string} permissionName - The name of the permission to check.
//    * @returns {boolean}
//    */
//   const hasPermission = (permissionName) => {
//     // Add a null/undefined check for user and user.roles
//     if (!user || !user.roles) {
//       return false;
//     }

//     // Flatten all permissions from all roles into a single array
//     const allPermissions = user.roles.flatMap(role => {
//         // Ensure role.permissions is also not null/undefined
//         if (!role || !role.permissions) {
//             return [];
//         }
//         return role.permissions.map(p => p.name);
//     });

//     // Check if the permission name is in the list
//     return allPermissions.includes(permissionName);
//   };

//   return { hasPermission };
// }


// src/hooks/usePermissions.js
import { useAuth } from "../app/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permissionName) => {
    if (!user) return false;

    const roles = user.roles || [];

    // Give full access to admin/super-admin roles
    if (roles.some(r => ["admin", "super-admin"].includes(String(r?.name).toLowerCase()))) {
      return true;
    }

    const all = roles.flatMap(r => (r?.permissions || []).map(p => p?.name)).filter(Boolean);
    return all.includes(permissionName);
  };

  return { hasPermission };
}
