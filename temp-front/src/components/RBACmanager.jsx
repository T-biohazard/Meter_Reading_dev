import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from "../app/AuthContext";
import { useApi } from "../hooks/useApi";
import { useToast } from "../hooks/useToast";

const RBACManager = () => {
    const api = useApi();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();

    // State for managing UI selections and changes
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // --- Data Fetching with TanStack Query ---
    // Fetch roles
    const {
        data: allRoles,
        isLoading: isLoadingRoles,
        isError: isErrorRoles,
    } = useQuery({
        queryKey: ['roles'],
        queryFn: api.getRoles,
        enabled: isAuthenticated,
    });

    // Fetch page elements with their permissions
    const {
        data: pageElements,
        isLoading: isLoadingPages,
        isError: isErrorPages,
    } = useQuery({
        queryKey: ['pageElements'],
        queryFn: api.getPageElements,
        enabled: isAuthenticated,
    });

    // Combine loading and error states
    const isLoading = isLoadingRoles || isLoadingPages;
    const isError = isErrorRoles || isErrorPages;

    useEffect(() => {
        if (isError) {
            addToast("Failed to load data. Please check your network connection.", "error");
        }
    }, [isError, addToast]);

    // Sync selected permissions when a new role is selected
    useEffect(() => {
        if (selectedRole && allRoles) {
            const roleDetails = allRoles.find(role => role.id === selectedRole.id);
            if (roleDetails) {
                // Ensure permissions array exists before mapping
                const currentPermissions = roleDetails.permissions ? roleDetails.permissions.map(p => p.name) : [];
                setSelectedPermissions(currentPermissions);
            }
        }
    }, [selectedRole, allRoles]);

    // --- Permission Management Logic ---
    const handleTogglePermission = (permissionName) => {
        setSelectedPermissions(prevPermissions => {
            if (prevPermissions.includes(permissionName)) {
                return prevPermissions.filter(name => name !== permissionName);
            } else {
                return [...prevPermissions, permissionName];
            }
        });
    };
    
    const savePermissionsMutation = useMutation({
      mutationFn: async (payload) => {
          setIsSaving(true);
          return api.updateRole(selectedRole.id, payload);
      },
      onSuccess: () => {
          queryClient.invalidateQueries(['roles']); // Invalidate roles to get the latest state
          addToast("Permissions updated successfully!", "success");
          setIsSaving(false);
      },
      onError: (error) => {
          addToast(`Error updating permissions: ${error.message}`, "error");
          setIsSaving(false);
      }
    });

    const handleSaveChanges = () => {
        const payload = {
            permissions: selectedPermissions,
        };
        savePermissionsMutation.mutate(payload);
    };

    // Determine if changes have been made to enable the Save button
    const originalPermissions = selectedRole?.permissions?.map(p => p.name).sort() || [];
    const currentPermissionsSorted = [...selectedPermissions].sort();
    const hasChanges = JSON.stringify(originalPermissions) !== JSON.stringify(currentPermissionsSorted);

    // --- Conditional Rendering for initial states ---
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You must be logged in to view this page.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-8 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center text-gray-900 dark:text-white">Role-Based Access Control</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Role Selector */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Select a Role</h2>
                        <ul className="space-y-4">
                            {allRoles?.map(role => (
                                <li key={role.id}>
                                    <button
                                        type="button"
                                        className={`w-full text-left font-medium py-3 px-5 rounded-2xl transition-all duration-200
                                        ${selectedRole?.id === role.id 
                                            ? 'bg-blue-600 text-white shadow-lg' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Panel: Permission Management */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                        {selectedRole ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-bold">{selectedRole.name} Permissions</h2>
                                    <button
                                        className={`btn btn-primary btn-lg font-bold transition-transform transform hover:scale-105
                                        ${isSaving || !hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={handleSaveChanges}
                                        disabled={!hasChanges || isSaving}
                                    >
                                        {isSaving ? (
                                            <span className="flex items-center">
                                                <span className="loading loading-spinner mr-2"></span>
                                                Saving...
                                            </span>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 mb-8">Select the permissions you want to grant to this role.</p>

                                {/* Permission Checkboxes Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {pageElements?.map(element => (
                                        <label 
                                            // The key should be a unique ID, not the name, to prevent React from misbehaving.
                                            key={element.id} 
                                            className={`flex items-center space-x-3 p-4 rounded-xl shadow-inner cursor-pointer transition-all duration-200 border
                                            ${selectedPermissions.includes(element.name) 
                                                ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-600'
                                                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary w-5 h-5"
                                                checked={selectedPermissions.includes(element.name)}
                                                onChange={() => handleTogglePermission(element.name)}
                                            />
                                            <span className={`font-medium ${selectedPermissions.includes(element.name) ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {/* Use a fallback value if the name is not present or is an empty string */}
                                                {element.name || `Permission ID: ${element.id}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center">
                                <p className="text-xl text-gray-500">Please select a role from the left panel to manage permissions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RBACManager;
