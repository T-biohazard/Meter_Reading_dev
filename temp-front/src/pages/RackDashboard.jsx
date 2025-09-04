// src/pages/RackDashboard.jsx

import DataTable from '../components/table/DataTable';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import RackForm from '../components/rack/RackForm';
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import FilterMenu from '../components/table/FilterMenu';
import InputField from '../components/fields/InputField';
import SelectField from '../components/fields/SelectField';

/**
 * Rack dashboard component with full CRUD functionality.
 */
export default function RackDashboard() {
  const api = useFastApi();
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRack, setEditingRack] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');
  const [datacenterOptions, setDatacenterOptions] = useState([]);

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

  const fetchRacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both racks and datacenters concurrently
      const [racksData, datacentersData] = await Promise.all([
        api.listRacks(),
        api.listDatacenters()
      ]);

      // Create a map for quick datacenter name lookup
      const datacenterMap = new Map(datacentersData.map(dc => [dc.id, dc.datacenter_name]));
      
      // Map the racks to include the datacenter name
      const racksWithNames = racksData.map(rack => ({
        ...rack,
        datacenter_name: datacenterMap.get(rack.datacenter_id) || 'N/A'
      }));

      setRacks(racksWithNames);
      // Set datacenter options for the form and filters
      setDatacenterOptions(datacentersData.map(dc => ({ label: dc.datacenter_name, value: dc.id })));
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err.message);
      showToast("Failed to fetch data.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);


  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  const openNewForm = () => {
    setIsEditMode(false);
    setEditingRack(null);
    setAddOpen(true);
  };

  const handleEdit = (rack) => {
    setIsEditMode(true);
    // Pass the original rack object with ID for form submission
    const originalRack = racks.find(r => r.id === rack.id);
    setEditingRack(originalRack);
    setAddOpen(true);
  };

  const handleDelete = async (rackId) => {
    if (window.confirm("Are you sure you want to delete this rack?")) {
      try {
        await api.deleteRack(rackId);
        showToast("Rack deleted successfully.", "success");
      } catch (err) {
        showToast("Failed to delete rack.", "error");
        console.error("Delete failed:", err);
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

  // 👈 Update column definitions to include `field` and `fieldProps`
  const rackColumns = useMemo(() => [
    { 
      key: 'datacenter_name', 
      header: 'Datacenter Name',
      field: SelectField, 
      fieldProps: { options: datacenterOptions }
    },
    { key: 'rack_name', header: 'Rack Name', field: InputField },
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
  ], [handleEdit, handleDelete, datacenterOptions]);

  const filteredRacks = useMemo(() => {
    let result = racks;
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(row =>
        rackColumns.some(c =>
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
          // Filter by datacenter_id when the filter is applied
          if (key === 'datacenter_name') {
             // Find the corresponding datacenter ID from options
             const datacenterId = datacenterOptions.find(opt => opt.label.toLowerCase() === String(value).toLowerCase())?.value;
             return String(row.datacenter_id) === String(datacenterId);
          }
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [racks, query, filters, rackColumns, datacenterOptions]);

  if (addOpen) {
    return (
      <RackForm
        initialValues={editingRack}
        isEditMode={isEditMode}
        onSubmit={handleFormSubmit}
        onCancel={() => setAddOpen(false)}
        showToast={showToast}
        datacenterOptions={datacenterOptions} // Pass datacenter options to the form
      />
    );
  }

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Racks</h1>
          <p className="opacity-70">View and Manage the list of Racks.</p>
        </div>
        <div className="flex items-center gap-4">
          
          <ExportButton 
            data={racks} 
            columns={rackColumns} 
            fileName="racks" 
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Rack
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading racks...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          title="Rack Records"
          data={filteredRacks}
          columns={rackColumns}
          searchable={true}
          selection={true}
          showId={true}
          filterComponent={<FilterMenu columns={rackColumns} onFilterChange={setFilters} />}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}