// src/pages/CustomerDashboard.jsx
import DataTable from '../components/table/DataTable';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import CustomerForm from '../components/customer/CustomerForm';
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExportButton from '../components/ui/ExportButton'; // Import the new ExportButton component
import { FaFileExcel } from 'react-icons/fa';
import FilterMenu from '../components/table/FilterMenu'; // 👈 Import the FilterMenu component

/**
 * Customer dashboard component with full CRUD functionality.
 */
export default function CustomerDashboard() {
  const api = useFastApi();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({}); // 👈 Add state for filters
  const [query, setQuery] = useState(''); // 👈 Add state for search query

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  };

  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError(err.message);
      showToast("Failed to fetch customers.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openNewForm = () => {
    setIsEditMode(false);
    setEditingCustomer(null);
    setAddOpen(true);
  };

  const handleEdit = (customer) => {
    setIsEditMode(true);
    setEditingCustomer(customer);
    setAddOpen(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.deleteCustomer(customerId);
        showToast("Customer deleted successfully.", "success");
      } catch (err) {
        showToast("Failed to delete customer.", "error");
        console.error("Delete failed:", err);
      } finally {
        fetchCustomers();
      }
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      if (isEditMode) {
        await api.updateCustomer(editingCustomer.id, values);
        showToast("Customer updated successfully.", "success");
      } else {
        await api.createCustomer(values);
        showToast("Customer created successfully.", "success");
      }
    } catch (err) {
      showToast(err.message || "Save failed.", "error");
    } finally {
      fetchCustomers();
      resetForm();
      setAddOpen(false);
    }
  };

  const customerColumns = useMemo(() => [
    { key: 'formula_billing_id', header: 'Billing ID', align: 'center' },
    { key: 'customer', header: 'Customer Name' },
    { key: 'threshold', header: 'Threshold' },
    { key: 'grace_value', header: 'Grace Value' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Created At', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'updated_at', header: 'Updated At', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => (
        <div className="flex">
          {/* Edit Button with Lucide Pencil icon */}
          <Button variant='icon' size="sm" onClick={() => handleEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          {/* Delete Button with Lucide Trash2 icon */}
          <Button variant='icon' size="sm" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  // The filtered data will now consider both the search query and the filters from the menu
  const filteredCustomers = useMemo(() => {
    let result = customers;
    
    // 1. Apply global search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(row =>
        customerColumns.some(c =>
          String(row[c.key] ?? "").toLowerCase().includes(q)
        )
      );
    }
    
    // 2. Apply dynamic filters from FilterMenu
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'status') {
            return String(row[key]).toLowerCase() === String(value).toLowerCase();
          }
          if (key === 'threshold') {
            return Number(row[key]) >= Number(value);
          }
          // Default text-based filter
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [customers, query, filters, customerColumns]);

  if (addOpen) {
    return (
      <CustomerForm
        initialValues={editingCustomer}
        isEditMode={isEditMode}
        onSubmit={handleFormSubmit}
        onCancel={() => setAddOpen(false)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Customer</h1>
          <p className="opacity-70">View and Manage the list of Customers.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <FilterMenu columns={customerColumns} onFilterChange={setFilters} /> {/* 👈 Add the FilterMenu component */}
          {/* Export Button */}
          <ExportButton 
            data={customers} 
            columns={customerColumns} 
            fileName="customers" 
            intent="primary" // Change button style
            leftIcon={FaFileExcel} // Change icon
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none" // Add custom Tailwind classes
          >
            Export
          </ExportButton>
          
          {/* Add Customer Button */}
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Customer
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading customers...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          title="Customer Records"
          data={filteredCustomers} // 👈 Pass the filtered data to the table
          columns={customerColumns}
          searchable={true}
          selection={true}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}