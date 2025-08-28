// src/hooks/useUpdateRolePermissions.js
/**
 * @fileoverview A custom React hook for updating a role's permissions.
 * It uses TanStack Query's useMutation for server-side state updates.
 * This version uses the correct service function and sends the expected payload.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';
import { queryKeys } from '../services/queryKeys';
import { useToast } from './useToast';
import { useAuth } from '../app/AuthContext';

/**
 * Custom hook to update a role's permissions.
 * @returns {object} The mutation object from TanStack Query.
 */
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { token } = useAuth();

  return useMutation({
    // The mutation function now receives the full payload from the component
    mutationFn: (payload) => {
      // Correctly call the existing updateRole service function with the
      // role ID and the full payload containing permissions and name.
      // The `payload.permissions` now contains an array of names.
      return authService.updateRole(payload.id, { permissions: payload.permissions, name: payload.name }, token);
    },
    onSuccess: () => {
      // Invalidate the cache to refetch the latest roles data
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      addToast({
        message: 'Permissions saved successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      console.error('Failed to update role permissions:', error);
      addToast({
        message: `Error saving permissions: ${error.message}`,
        type: 'error',
      });
    },
  });
};
