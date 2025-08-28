// src/services/queryFunctions.js
/**
 * @fileoverview Contains asynchronous functions that wrap API calls for TanStack Query.
 * This file acts as a clean, reusable layer between the hooks and the authService.
 * It's crucial for separating API logic from component logic.
 */
import authService from "./authService";

/**
 * Fetches all roles from the backend.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} A promise that resolves to an array of roles.
 */
export const fetchRoles = (token) => {
  return authService.getRoles(token);
};

/**
 * Fetches all page elements from the backend.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Array>} A promise that resolves to an array of page elements.
 */
export const fetchPageElements = (token) => {
  return authService.getPageElements(token);
};

/**
 * Updates a role's permissions.
 * @param {object} payload - An object containing the role's ID and the new permissions.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<object>} A promise that resolves to the updated role object.
 */
export const updateRolePermissions = (payload, token) => {
  return authService.updateRole(payload.id, { permissions: payload.permissions }, token);
};
