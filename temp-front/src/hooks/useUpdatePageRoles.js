// src/hooks/useUpdatePageRoles.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from './useApi';

export function useUpdatePageRoles() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, roleIds }) => api.updatePageRoles(pageId, roleIds),
    onSuccess: (responseData) => {
      // Manually update the 'page-elements' cache
      queryClient.setQueryData(['page-elements'], (oldPageElements) => {
        if (!oldPageElements) return [];
        
        return oldPageElements.map((pageElement) => {
          if (pageElement.id === responseData.page_element.id) {
            return responseData.page_element;
          }
          return pageElement;
        });
      });

      // Invalidate the 'roles' query to ensure a full refetch if you select a different role.
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      
      console.log('Page roles updated successfully:', responseData);
    },
    onError: (error) => {
      console.error('Failed to update page roles:', error);
    },
  });
}