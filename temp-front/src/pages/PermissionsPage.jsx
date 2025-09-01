// src/pages/PermissionsPage.jsx
/**
 * @fileoverview The new main page component for managing roles and permissions.
 * It serves as a simple wrapper for the new PermissionsTable component,
 * which now handles all the UI logic. This keeps the page component clean.
 */
import React from 'react';
import PermissionsTable from '../components/permissions/PermissionsTable';
import ToastContainer from '../components/ui/ToastContainer';
import { useToast } from '../hooks/useToast';

const PermissionsPage = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="min-h-screen  p-4 md:p-8 flex justify-center">
      <div className="container mx-auto">
        <PermissionsTable />
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PermissionsPage;
