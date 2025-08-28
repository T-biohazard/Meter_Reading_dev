// src/services/queryKeys.js
/**
 * @fileoverview Defines a centralized, hierarchical structure for all TanStack Query keys.
 * This practice improves cache management and ensures consistency across the application.
 * Each key is an array to allow for caching with unique identifiers (e.g., ['roles', 1]).
 */
export const queryKeys = {
  // Key for fetching all roles.
  roles: {
    all: ['roles'],
    // Key for a single role, dynamically created with a roleId.
    detail: (roleId) => [...queryKeys.roles.all, roleId],
  },
  // Key for fetching all page elements.
  pageElements: {
    all: ['page-elements'],
  },
};
