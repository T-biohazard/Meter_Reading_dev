import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../app/AuthContext";
import { useUsers } from "./useUsers ";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineLeft,
  AiOutlineRight,
} from "react-icons/ai";
import UserStats from "./UserStats";
import UserSkeleton from "./UserSkeleton";

/**
 * Main User Management Dashboard Component
 * This component now manages modals using native <dialog> elements via a ref.
 */
export function UserManagement() {
  const { isAuthenticated, user: currentUser } = useAuth();
  
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 10;

  const { users, roles, isLoading, error, createUser, updateUser, deleteUser, totalUsers, isCreating, isUpdating, isDeleting } = useUsers({
    page,
    limit: usersPerPage,
    searchQuery,
  });

  const [modalState, setModalState] = useState({ type: null, user: null });
  
  // Create refs for the dialog elements
  const editDialogRef = useRef(null);
  const deleteDialogRef = useRef(null);
  const createDialogRef = useRef(null);

  // useEffect to manage the dialog's open/close state
  useEffect(() => {
    // Determine which dialog to show or hide based on modalState
    if (modalState.type === "edit") {
      editDialogRef.current?.showModal();
    } else if (modalState.type === "delete") {
      deleteDialogRef.current?.showModal();
    } else if (modalState.type === "create") {
      createDialogRef.current?.showModal();
    } else {
      // Close any open modals
      editDialogRef.current?.close();
      deleteDialogRef.current?.close();
      createDialogRef.current?.close();
    }
  }, [modalState]);

  const hasPermission = currentUser?.roles?.some(
    (role) => role.name === "admin" || role.name === "manager"
  );
  
  const handleAction = async (actionFunction, ...args) => {
    try {
      await actionFunction(...args);
      setModalState({ type: null, user: null });
    } catch (err) {
      console.error("Action failed:", err.message);
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const handleNextPage = () => setPage((old) => (old < totalPages ? old + 1 : old));
  const handlePrevPage = () => setPage((old) => Math.max(old - 1, 1));

  const isProcessing = isCreating || isUpdating || isDeleting;

  if (!isAuthenticated) {
    return (
      <div className="p-4 text-center text-error">
        Please log in to manage users.
      </div>
    );
  }
  
  /**
   * Refactored: A self-contained form component for creating or updating users.
   * It now receives an 'onSuccess' prop to signal when the action is complete.
   */
  const UserForm = ({ onSubmit, onCancel, onSuccess, userToEdit, roles, isSubmitting }) => {
    const [formData, setFormData] = useState({
      name: userToEdit?.name || "",
      first_name: userToEdit?.first_name || "",
      last_name: userToEdit?.last_name || "",
      email: userToEdit?.email || "",
      mobile: userToEdit?.mobile || "",
      password: "",
      role_name: userToEdit?.roles?.[0]?.name || roles?.[0]?.name || "",
      team_id: userToEdit?.team_id || "",
      dept_id: userToEdit?.dept_id || "",
    });
    const [error, setError] = useState(null);
    const isEditing = !!userToEdit;
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setError(null);
        const payload = { ...formData };
        
        if (isEditing) {
          if (!payload.password) {
            delete payload.password;
          } else {
            payload.password_confirmation = payload.password;
          }
        } else {
          if (!payload.password) {
            setError("Password is required for new users.");
            return;
          }
          payload.password_confirmation = payload.password;
        }
        
        // Await the API call
        await onSubmit(isEditing ? { userId: userToEdit.id, payload } : payload);
        
        // If the call succeeds, close the modal via the onSuccess callback
        onSuccess();
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Mobile</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password {isEditing && "(leave blank to keep current)"}</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              required={!isEditing}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
              disabled={isSubmitting}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Team ID</span>
            </label>
            <input
              type="number"
              name="team_id"
              value={formData.team_id}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isSubmitting}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Department ID</span>
            </label>
            <input
              type="number"
              name="dept_id"
              value={formData.dept_id}
              onChange={handleChange}
              className="input input-bordered w-full"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="modal-action mt-6">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : (isEditing ? "Update User" : "Create User")}
          </button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="p-8 bg-base-200 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-base-content">User Management Dashboard</h1>
        {hasPermission && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setModalState({ type: "create", user: null });
            }}
            disabled={isProcessing}
          >
            <AiOutlinePlus className="mr-2" /> Add New User
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full pl-10"
            disabled={isLoading || isProcessing}
          />
          <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <div className="w-full md:w-auto">
          {!isLoading && <UserStats totalUsers={totalUsers} users={users} />}
        </div>
      </div>

      {isLoading && <UserSkeleton />}
      {error && <div className="alert alert-error my-4">{error.message}</div>}

      {!isLoading && !error && users.length > 0 && (
        <>
          <div className="overflow-x-auto shadow-xl rounded-lg">
            <table className="table w-full table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-base-300 transition-colors">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm opacity-50">@{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge badge-ghost badge-sm">
                        {user.roles?.[0]?.name || "N/A"}
                      </span>
                    </td>
                    <td>{user.team_id || "N/A"}</td>
                    <td>
                      {hasPermission && (
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => {
                              setModalState({ type: "edit", user });
                            }}
                            disabled={isProcessing}
                          >
                            <AiOutlineEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => {
                              setModalState({ type: "delete", user });
                            }}
                            disabled={isProcessing}
                          >
                            <AiOutlineDelete />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-base-content opacity-70">
              Page {page} of {totalPages}
            </p>
            <div className="join">
              <button
                className="join-item btn btn-md"
                onClick={handlePrevPage}
                disabled={page === 1 || isProcessing}
              >
                <AiOutlineLeft />
              </button>
              <button
                className="join-item btn btn-md"
                onClick={handleNextPage}
                disabled={page >= totalPages || isProcessing}
              >
                <AiOutlineRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* CREATE DIALOG */}
      <dialog ref={createDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Create New User</h3>
          <UserForm
            onSubmit={createUser}
            onCancel={() => setModalState({ type: null, user: null })}
            onSuccess={() => setModalState({ type: null, user: null })} // Pass onSuccess prop
            roles={roles}
            isSubmitting={isProcessing}
          />
        </div>
      </dialog>

      {/* EDIT DIALOG */}
      <dialog ref={editDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Edit User: {modalState.user?.name}</h3>
          <UserForm
            onSubmit={updateUser}
            onCancel={() => setModalState({ type: null, user: null })}
            onSuccess={() => setModalState({ type: null, user: null })} // Pass onSuccess prop
            userToEdit={modalState.user}
            roles={roles}
            isSubmitting={isProcessing}
          />
        </div>
      </dialog>

      {/* DELETE DIALOG */}
      <dialog ref={deleteDialogRef} className="modal bg-black bg-opacity-50">
        <div className="modal-box relative p-6 bg-base-100 rounded-lg shadow-xl w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Confirm Deletion</h3>
          <p className="py-4">
            Are you sure you want to delete the user **{modalState.user?.name}**? This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setModalState({ type: null, user: null })}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button className="btn btn-error" onClick={() => handleAction(deleteUser, modalState.user.id)} disabled={isProcessing}>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
