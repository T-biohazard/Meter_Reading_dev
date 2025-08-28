// src/hooks/useRoles.js
/**
 * @fileoverview A custom React hook for fetching a list of roles.
 * It uses TanStack Query to manage fetching state, caching, and background updates.
 * This hook abstracts the data fetching logic away from the UI components.
 */
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '../services/queryFunctions';
import { useAuth } from '../app/AuthContext';
import { queryKeys } from '../services/queryKeys';

/**
 * Custom hook to fetch all roles.
 * @returns {object} The query result object from TanStack Query.
 */
export const useRoles = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: () => fetchRoles(token),
    // Use a stale time to prevent unnecessary network requests.
    // Data will be considered fresh for 5 minutes.
    staleTime: 1000 * 60 * 5, 
  });
};
