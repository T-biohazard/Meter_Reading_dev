// src/pages/DatacenterDashboard.jsx

import DataTable from '../components/table/DataTable';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import DatacenterForm from '../components/datacenter/DatacenterForm';
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import FilterMenu from '../components/table/FilterMenu';
import InputField from '../components/fields/InputField';
import SelectField from '../components/fields/SelectField';

/**
 * Datacenter dashboard component with full CRUD functionality.
 */
export default function DatacenterDashboard() {
  const api = useFastApi();
  const [datacenters, setDatacenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDatacenter, setEditingDatacenter] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');

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

  const fetchDatacenters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listDatacenters();
      setDatacenters(data);
    } catch (err) {
      console.error("Failed to fetch datacenters:", err);
      setError(err.message);
      showToast("Failed to fetch datacenters.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchDatacenters();
  }, [fetchDatacenters]);

  const openNewForm = () => {
    setIsEditMode(false);
    setEditingDatacenter(null);
    setAddOpen(true);
  };

  const handleEdit = (datacenter) => {
    setIsEditMode(true);
    setEditingDatacenter(datacenter);
    setAddOpen(true);
  };

  const handleDelete = async (datacenterId) => {
    if (window.confirm("Are you sure you want to delete this datacenter?")) {
      try {
        await api.deleteDatacenter(datacenterId);
        showToast("Datacenter deleted successfully.", "success");
      } catch (err) {
        showToast("Failed to delete datacenter.", "error");
        console.error("Delete failed:", err);
      } finally {
        fetchDatacenters();
      }
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      if (isEditMode) {
        await api.updateDatacenter(editingDatacenter.id, values);
        showToast("Datacenter updated successfully.", "success");
      } else {
        await api.createDatacenter(values);
        showToast("Datacenter created successfully.", "success");
      }
    } catch (err) {
      showToast(err.message || "Save failed.", "error");
    } finally {
      fetchDatacenters();
      resetForm();
      setAddOpen(false);
    }
  };

  // 👈 Update column definitions to include `field` and `fieldProps`
  const datacenterColumns = useMemo(() => [
    { key: 'datacenter_name', header: 'Datacenter Name', field: InputField },
    { 
      key: 'status', 
      header: 'Status', 
      field: SelectField, 
      fieldProps: { 
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' }
        ]
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => (
        <div className="flex">
          <Button variant='icon' size="sm" onClick={() => handleEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          {/* <Button variant='icon' size="sm" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button> */}
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const filteredDatacenters = useMemo(() => {
    let result = datacenters;
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(row =>
        datacenterColumns.some(c =>
          String(row[c.key] ?? "").toLowerCase().includes(q)
        )
      );
    }
    
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'status') {
            return String(row[key]).toLowerCase() === String(value).toLowerCase();
          }
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [datacenters, query, filters, datacenterColumns]);

  if (addOpen) {
    return (
      <DatacenterForm
        initialValues={editingDatacenter}
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
          <h1 className='text-2xl font-bold'>Datacenters</h1>
          <p className="opacity-70">View and Manage the list of Datacenters.</p>
        </div>
        <div className="flex items-center gap-4">
          <FilterMenu columns={datacenterColumns} onFilterChange={setFilters} />
          <ExportButton 
            data={datacenters} 
            columns={datacenterColumns} 
            fileName="datacenters" 
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Datacenter
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading datacenters...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          title="Datacenter Records"
          data={filteredDatacenters}
          columns={datacenterColumns}
          searchable={true}
          selection={true}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}