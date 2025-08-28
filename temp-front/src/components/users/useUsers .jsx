import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  useMemo
} from 'react';
import authService from '../../services/authService';
import {
  useAuth
} from '../../app/AuthContext';

/**
 * A senior-level custom React hook to manage all user data operations using React Query.
 * This version implements client-side pagination and searching as the backend
 * does not support these features directly.
 * @param {object} options - Configuration for fetching.
 * @param {number} options.page - The current page number for pagination.
 * @param {number} options.limit - The number of items to fetch per page.
 * @param {string} options.searchQuery - The search term to filter users.
 */
export const useUsers = (options) => {
  const {
    token,
    isAuthenticated
  } = useAuth();
  const queryClient = useQueryClient();
  const {
    page,
    limit,
    searchQuery
  } = options;

  // useQuery to fetch ALL users and roles once. The query key is now simple
  // because we're fetching everything, not per page.
  const {
    data: allUsersAndRoles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("User is not authenticated.");
      }

      // We fetch ALL users and roles.
      const [usersResponse, rolesResponse] = await Promise.all([
        authService.apiRequest('/users', {
          method: "GET"
        }, token),
        authService.getRoles(token)
      ]);

      // Return both users and roles for client-side processing
      return {
        users: usersResponse.users || [],
        roles: rolesResponse || [],
      };
    },
    enabled: isAuthenticated,
    // Do not refetch on window focus as we want to handle pagination on the client
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  });

  // Client-side filtering and pagination logic
  // This memoized value ensures we don't re-calculate unless dependencies change
  const usersData = useMemo(() => {
    if (!allUsersAndRoles) {
      return {
        users: [],
        roles: [],
        totalUsers: 0,
        paginatedUsers: [],
      };
    }

    // Step 1: Filter the users based on the search query
    const filteredUsers = allUsersAndRoles.users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Step 2: Calculate the total number of users after filtering
    const totalUsers = filteredUsers.length;

    // Step 3: Implement client-side pagination by slicing the filtered array
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return {
      users: paginatedUsers,
      roles: allUsersAndRoles.roles,
      totalUsers,
    };
  }, [allUsersAndRoles, searchQuery, page, limit]);

  // useMutation for creating a new user
  const createUserMutation = useMutation({
    mutationFn: (payload) => authService.apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(payload)
    }, token),
    onSuccess: () => {
      // Invalidate the main 'allUsers' query to refetch all data from the server
      queryClient.invalidateQueries({
        queryKey: ['allUsers']
      });
    },
  });

  // useMutation for updating an existing user
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      payload
    }) => authService.apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }, token),
    onSuccess: () => {
      // Invalidate the main 'allUsers' query
      queryClient.invalidateQueries({
        queryKey: ['allUsers']
      });
    },
  });

  // useMutation for deleting a user with optimistic updates
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => authService.apiRequest(`/users/${userId}`, {
      method: "DELETE"
    }, token),
    onMutate: async (deletedUserId) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({ queryKey: ['allUsers'] });

        // Snapshot the previous value
        const previousUsers = queryClient.getQueryData(['allUsers']);

        // Optimistically update to the new value
        queryClient.setQueryData(['allUsers'], (old) => ({
            ...old,
            users: old.users.filter((user) => user.id !== deletedUserId),
        }));

        // Return a context object with the snapshot value
        return { previousUsers };
    },
    onError: (err, deletedUserId, context) => {
        // If the mutation fails, roll back the cache to the previous snapshot
        queryClient.setQueryData(['allUsers'], context.previousUsers);
        console.error("Delete failed, rolling back:", err);
    },
    onSettled: () => {
        // Re-run the fetch to ensure we are in sync with the server state
        queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });

  return {
    // Return the paginated and filtered users from the memoized value
    users: usersData.users,
    roles: usersData.roles,
    totalUsers: usersData.totalUsers,
    isLoading,
    error,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
    isCreating: createUserMutation.isLoading,
    isUpdating: updateUserMutation.isLoading,
    isDeleting: deleteUserMutation.isLoading,
  };
};
