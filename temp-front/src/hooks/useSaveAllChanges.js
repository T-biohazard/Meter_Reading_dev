// src/hooks/useSaveAllChanges.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUpdateRolePermissions } from './useUpdateRolePermissions';
import { useUpdatePageRoles } from './useUpdatePageRoles';
import { useToast } from './useToast';

export const useSaveAllChanges = () => {
  const { mutateAsync: updatePermissions } = useUpdateRolePermissions();
  const { mutateAsync: updatePageRoles } = useUpdatePageRoles();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ roleId, roleName, permissions, pageElements, localPages }) => {
      // Step 1: Update role permissions with the correct payload
      await updatePermissions({ id: roleId, name: roleName, permissions });

      // Step 2: Iterate and update page roles
      const pageUpdates = pageElements.map(async (page) => {
        const hasAccessInLocalState = localPages.has(page.id);
        const hasExistingRole = page.roles?.some(r => r.id === roleId);

        if (hasAccessInLocalState !== hasExistingRole) {
          let finalRoleIds = page.roles?.map(r => r.id) || [];
          if (hasAccessInLocalState) {
            finalRoleIds.push(roleId);
          } else {
            finalRoleIds = finalRoleIds.filter(rId => rId !== roleId);
          }
          const uniqueRoleIds = [...new Set(finalRoleIds)];
          await updatePageRoles({ pageId: page.id, roleIds: uniqueRoleIds });
        }
      });

      await Promise.all(pageUpdates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['page-elements'] });
      addToast({
        message: 'All changes saved successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      console.error('Failed to save all changes:', error);
      addToast({
        message: `Error saving changes: ${error.message}`,
        type: 'error',
      });
    },
  });
};