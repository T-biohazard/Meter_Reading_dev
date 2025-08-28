// src/hooks/usePageElements.js
/**
 * @fileoverview A custom React hook for fetching all page elements and their permissions.
 * This hook uses TanStack Query to manage the server state for the permissions editor.
 * The API already returns the data in the correct structure, so no transformation is needed here.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchPageElements } from '../services/queryFunctions';
import { useAuth } from '../app/AuthContext';
import { queryKeys } from '../services/queryKeys';

/**
 * Custom hook to fetch all page elements.
 * @returns {object} The query result object from TanStack Query.
 */
export const usePageElements = () => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.pageElements.all,
    queryFn: () => fetchPageElements(token),
    // Data is already in the correct format, so we don't need a select function.
    staleTime: 1000 * 60 * 5,
  });
};
