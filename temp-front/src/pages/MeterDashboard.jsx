// src/pages/MeterDashboard.jsx
import DataTable from '../components/table/DataTable';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import MeterForm from '../components/meter/MeterForm';
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import FilterMenu from '../components/table/FilterMenu';
import InputField from '../components/fields/InputField';
import SelectField from '../components/fields/SelectField';

/**
 * Meter dashboard component with full CRUD functionality.
 */
export default function MeterDashboard() {
  const api = useFastApi();
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMeter, setEditingMeter] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');
  const [datacenterOptions, setDatacenterOptions] = useState([]);
  const [rackOptions, setRackOptions] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Store the fetched datacenters and racks in state for lookup
  const [allDatacenters, setAllDatacenters] = useState([]);
  const [allRacks, setAllRacks] = useState([]);

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

  const fetchDependencies = useCallback(async () => {
    try {
      const datacenters = await api.listDatacenters();
      const racks = await api.listRacks();
      setAllDatacenters(datacenters);
      setAllRacks(racks);
      setDatacenterOptions(datacenters.map(dc => ({ label: dc.datacenter_name, value: dc.id })));
      setRackOptions(racks.map(rack => ({ label: rack.rack_name, value: rack.id })));
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Failed to fetch dependencies:", err);
      showToast("Failed to load form data.", "error");
    }
  }, [api, showToast]);

  const fetchMeters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metersData, datacentersData, racksData] = await Promise.all([
        api.listMeters(),
        api.listDatacenters(),
        api.listRacks()
      ]);
      
      // Create lookup maps for performance
      const datacenterMap = new Map(datacentersData.map(dc => [dc.id, dc.datacenter_name]));
      const rackMap = new Map(racksData.map(rack => [rack.id, rack.rack_name]));
      
      const metersWithNames = metersData.map(meter => ({
        ...meter,
        datacenter_name: datacenterMap.get(meter.datacenter_id) || 'N/A',
        rack_name: rackMap.get(meter.rack_id) || 'N/A'
      }));
      
      setMeters(metersWithNames);
      setAllDatacenters(datacentersData);
      setAllRacks(racksData);
      setDatacenterOptions(datacentersData.map(dc => ({ label: dc.datacenter_name, value: dc.id })));
      setRackOptions(racksData.map(rack => ({ label: rack.rack_name, value: rack.id })));

    } catch (err) {
      console.error("Failed to fetch meters:", err);
      setError(err.message);
      showToast("Failed to fetch meters.", "error");
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);
  
  const openNewForm = () => {
    setIsEditMode(false);
    setEditingMeter(null);
    setAddOpen(true);
  };

  const handleEdit = (meter) => {
    setIsEditMode(true);
    // When editing, pass the original meter object with IDs, as the form expects it.
    const originalMeter = meters.find(m => m.id === meter.id);
    setEditingMeter(originalMeter);
    setAddOpen(true);
  };

  const handleDelete = async (meterId) => {
    if (window.confirm("Are you sure you want to delete this meter?")) {
      try {
        await api.deleteMeter(meterId);
        showToast("Meter deleted successfully.", "success");
      } catch (err) {
        showToast("Failed to delete meter.", "error");
        console.error("Delete failed:", err);
      } finally {
        fetchMeters();
      }
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      if (isEditMode) {
        await api.updateMeter(editingMeter.id, values);
        showToast("Meter updated successfully.", "success");
      } else {
        await api.createMeter(values);
        showToast("Meter created successfully.", "success");
      }
    } catch (err) {
      showToast(err.message || "Save failed.", "error");
    } finally {
      fetchMeters();
      resetForm();
      setAddOpen(false);
    }
  };

  const meterColumns = useMemo(() => [
    { 
      key: 'datacenter_name', 
      header: 'Datacenter Name',
      // The `field` and `fieldProps` are for the form, so they should remain
      // connected to the ID fields, but the table will display the name.
      field: SelectField,
      fieldProps: { options: datacenterOptions, searchable: true }
    },
    { 
      key: 'rack_name', 
      header: 'Rack Name',
      field: SelectField,
      fieldProps: { options: rackOptions, searchable: true }
    },
    { key: 'serial', header: 'Serial', field: InputField },
    { key: 'name', header: 'Meter Name', field: InputField },
    { 
      key: 'primary_secondary', 
      header: 'Type',
      field: SelectField,
      fieldProps: {
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
        ]
      }
    },
    { 
      key: 'phase', 
      header: 'Phase',
      field: SelectField,
      fieldProps: {
        options: [
          { label: 'Phase 1', value: 'Phase 1' },
          { label: 'Phase 2', value: 'Phase 2' },
          { label: 'Phase 3', value: 'Phase 3' },
        ]
      }
    },
    { key: 'installed_point', header: 'Installed Point',  },
    { key: 'power_source', header: 'Power Source',  },
    { key: 'phase_source', header: 'Phase Source', },
    { 
      key: 'status', 
      header: 'Status',
      field: SelectField,
      fieldProps: {
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
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
  ], [handleEdit, handleDelete, datacenterOptions, rackOptions]);

  const filteredMeters = useMemo(() => {
    let result = meters;
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(row =>
        meterColumns.some(c =>
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
          if (key === 'datacenter_id' || key === 'rack_id') {
             return String(row[key]) === String(value);
          }
          // The filter logic for names needs to be updated.
          if (key === 'datacenter_name' || key === 'rack_name') {
             return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
          }
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [meters, query, filters, meterColumns]);

  if (addOpen) {
    return (
      <MeterForm
        initialValues={editingMeter}
        isEditMode={isEditMode}
        onSubmit={handleFormSubmit}
        onCancel={() => setAddOpen(false)}
        showToast={showToast}
        datacenterOptions={datacenterOptions} // Pass options to the form
        rackOptions={rackOptions} // Pass options to the form
      />
    );
  }

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Meters</h1>
          <p className="opacity-70">View and Manage the list of Meters.</p>
        </div>
        <div className="flex items-center gap-4">
          
          <ExportButton 
            data={meters} 
            columns={meterColumns} 
            fileName="meters" 
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Meter
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading meters...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          title="Meter Records"
          data={filteredMeters}
          columns={meterColumns}
          searchable={true}
          selection={true}
          showId={true}
          filterComponent={<FilterMenu columns={meterColumns} onFilterChange={setFilters} />}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}