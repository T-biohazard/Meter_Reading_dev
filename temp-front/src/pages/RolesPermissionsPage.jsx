// src/pages/RolesPermissionsPage.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { usePermissions } from "../hooks/usePermissions";
import Button from "../components/ui/Button";
import RolesTable from "../components/roles/RolesTable";
import RoleFormModal from "../components/roles/RoleFormModal";
import DeleteRoleModal from "../components/roles/DeleteRoleModal";
import RolesTableSkeleton from "../components/roles/RolesTableSkeleton";
import ToastContainer from "../components/ui/ToastContainer";
import { useToast } from "../hooks/useToast";

function RolesPermissionsPage() {
  const { hasPermission } = usePermissions();
  const api = useApi();
  const queryClient = useQueryClient();
  const { toasts, addToast, removeToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Fetch all roles
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: api.getRoles,
  });

  // Fetch all permissions
  const { data: permissions, isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ['permissions'],
    queryFn: api.getPermissions,
  });

  const isLoading = rolesLoading || permissionsLoading;
  const isError = rolesError || permissionsError;

  // Mutation for deleting a role
  const deleteMutation = useMutation({
    mutationFn: (id) => api.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setRoleToDelete(null);
      addToast("Role deleted successfully.", "success");
    },
    onError: (error) => {
      console.error("Failed to delete role:", error);
      addToast(`Failed to delete role: ${error.message}`, "error");
    },
  });

  // New mutation for syncing permissions
  const syncPermissionsMutation = useMutation({
    // This tells the hook to call the syncPermissions function from the API service
    mutationFn: () => api.syncPermissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      addToast("Permissions synced successfully.", "success");
    },
    onError: (error) => {
      addToast(`Failed to sync permissions: ${error.message}`, "error");
    },
});


  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <div className="flex items-center space-x-2">
          {hasPermission("sync.permissions") && (
            <Button
              intent="primary"
              leftIcon={RefreshCw}
              onClick={() => syncPermissionsMutation.mutate()}
              loading={syncPermissionsMutation.isPending}
            >
              Sync Permissions
            </Button>
          )}
          {hasPermission("roles.store") && (
            <Button intent="success" leftIcon={Plus} onClick={handleCreateRole}>
              Add New Role
            </Button>
          )}
        </div>
      </div>

      <div className="border ">
        <div className="card-body">
          {isLoading ? (
            <RolesTableSkeleton />
          ) : isError ? (
            <div className="alert alert-error">
              <div>
                <span>Error: {rolesError?.message || permissionsError?.message}</span>
              </div>
            </div>
          ) : (
            <RolesTable
              roles={roles}
              permissions={permissions}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
            />
          )}
        </div>
      </div>

      {isModalOpen && permissions && (
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          role={selectedRole}
          permissions={permissions}
          addToast={addToast} // Pass toast function to modal
        />
      )}

      {roleToDelete && (
        <DeleteRoleModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onConfirm={confirmDelete}
          role={roleToDelete}
          isLoading={deleteMutation.isPending}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default RolesPermissionsPage;

