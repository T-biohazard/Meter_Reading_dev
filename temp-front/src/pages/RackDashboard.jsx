// src/pages/RackDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '../components/table/DataTable';
import FilterMenu from '../components/table/FilterMenu';
import ExportButton from '../components/ui/ExportButton';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import RackForm from '../components/rack/RackForm'; // 👈 Import RackForm

export default function RackDashboard() {
  const api = useFastApi();
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [addOpen, setAddOpen] = useState(false); // 👈 Form state
  const [isEditMode, setIsEditMode] = useState(false); // 👈 Form state
  const [editingRack, setEditingRack] = useState(null); // 👈 Form state
  const [toasts, setToasts] = useState([]); // 👈 Toast state

  // Toast handlers
  const removeToast = (id) => setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, []);

  const fetchRacks = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedRacks = await api.listRacks();
      setRacks(fetchedRacks);
      setError(null);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching racks.');
      showToast('Failed to fetch racks.', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  // Handle form actions
  const openNewForm = () => {
    setIsEditMode(false);
    setEditingRack(null);
    setAddOpen(true);
  };

  const handleEdit = (rack) => {
    setIsEditMode(true);
    setEditingRack(rack);
    setAddOpen(true);
  };

  const handleDelete = async (rackId) => {
    if (window.confirm("Are you sure you want to delete this rack?")) {
      try {
        await api.deleteRack(rackId);
        showToast("Rack deleted successfully.", "success");
      } catch (err) {
        showToast("Failed to delete rack.", "error");
      } finally {
        fetchRacks();
      }
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      if (isEditMode) {
        await api.updateRack(editingRack.id, values);
        showToast("Rack updated successfully.", "success");
      } else {
        await api.createRack(values);
        showToast("Rack created successfully.", "success");
      }
    } catch (err) {
      showToast(err.message || "Save failed.", "error");
    } finally {
      fetchRacks();
      resetForm();
      setAddOpen(false);
    }
  };

  // The 'actions' column is now dynamic and depends on the handlers
  const rackColumns = useMemo(() => [
    { key: 'rack_id', header: 'Rack ID', render: (val) => <span>{val.substring(0, 8)}...</span> },
    { key: 'name', header: 'Name' },
    { key: 'datacenter_id', header: 'Datacenter ID', render: (val) => <span>{val.substring(0, 8)}...</span> },
    { key: 'location', header: 'Location' },
    { key: 'capacity', header: 'Capacity (U)' },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button variant="icon" size="sm" onClick={() => handleEdit(row)} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="icon" size="sm" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);
  
  const filteredRacks = useMemo(() => {
    return racks.filter(rack => {
      return Object.keys(filters).every(key => {
        const filterValue = String(filters[key]).toLowerCase();
        const rackValue = String(rack[key] || '').toLowerCase(); // Added safeguard

        return rackValue.includes(filterValue);
      });
    });
  }, [racks, filters]);
  
  const dataToExport = useMemo(() => {
    return filteredRacks.map(({ rack_id, name, datacenter_id, location, capacity }) => ({
      rack_id,
      name,
      datacenter_id,
      location,
      capacity,
    }));
  }, [filteredRacks]);

  // Conditionally render the form
  if (addOpen) {
    return (
      <RackForm
        initialValues={editingRack}
        isEditMode={isEditMode}
        onSubmit={handleFormSubmit}
        onCancel={() => setAddOpen(false)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Rack Management</h1>
        <div className="flex gap-2">
          <ExportButton data={dataToExport} columns={rackColumns} fileName="racks_data">
            Export
          </ExportButton>
          <Button intent="primary" leftIcon={Plus} onClick={openNewForm}>
            New Rack
          </Button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <FilterMenu columns={rackColumns} onFilterChange={setFilters} />
      </div>

      {loading && <p className="text-center text-gray-500">Loading racks...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <DataTable columns={rackColumns} data={filteredRacks} />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}