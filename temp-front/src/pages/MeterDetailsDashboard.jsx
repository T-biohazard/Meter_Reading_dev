import DataTable from '../components/table/DataTable';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import MeterDetailsForm from '../components/meter/MeterDetailsForm';
import { Plus, Pencil, Trash2 } from "lucide-react";
import ExportButton from '../components/ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import FilterMenu from '../components/table/FilterMenu';
import InputField from '../components/fields/InputField';
import SelectField from '../components/fields/SelectField';

/**
 * Meter Details dashboard component with mock CRUD functionality.
 */
export default function MeterDetailsDashboard() {
  const [meterDetails, setMeterDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDetails, setEditingDetails] = useState(null);
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
      setToasts((currentsToasts) => currentsToasts.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, []);

  const fetchMeterDetails = useCallback(() => {
    setLoading(true);
    // Mock data based on the provided table names
    const mockData = [
      {
        id: 1,
        meter_serial: "M-101",
        meter_name: "Main Meter 1",
        type: "primary",
        phase: "three-phase",
        datacenter_name: "DC-Alpha",
        installed_point: "A1-R1",
        power_source: "UPS-1",
        phase_source: "Main Grid",
        customer: "Customer A",
        billing_formula: "Formula A",
        threshold: 150.00,
        grace_value: 10.50,
        rack: "Rack 1",
        status: "active"
      },
      {
        id: 2,
        meter_serial: "M-102",
        meter_name: "Secondary Meter",
        type: "secondary",
        phase: "single-phase",
        datacenter_name: "DC-Beta",
        installed_point: "B2-R3",
        power_source: "PDU-4",
        phase_source: "Secondary",
        customer: "Customer B",
        billing_formula: "Formula C",
        threshold: 75.00,
        grace_value: 5.00,
        rack: "Rack 3",
        status: "inactive"
      },
      {
        id: 3,
        meter_serial: "M-103",
        meter_name: "Backup Meter",
        type: "primary",
        phase: "three-phase",
        datacenter_name: "DC-Alpha",
        installed_point: "A5-R2",
        power_source: "Generator",
        phase_source: "Backup",
        customer: "Customer A",
        billing_formula: "Formula B",
        threshold: 200.00,
        grace_value: 20.00,
        rack: "Rack 2",
        status: "active"
      },
    ];
    setMeterDetails(mockData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeterDetails();
  }, [fetchMeterDetails]);

  const openNewForm = () => {
    setIsEditMode(false);
    setEditingDetails(null);
    setAddOpen(true);
  };

  const handleEdit = (details) => {
    setIsEditMode(true);
    setEditingDetails(details);
    setAddOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this meter detail record?")) {
      const newMeterDetails = meterDetails.filter(item => item.id !== id);
      setMeterDetails(newMeterDetails);
      showToast("Meter detail deleted successfully.", "success");
    }
  };

  const handleFormSubmit = (values, { resetForm }) => {
    if (isEditMode) {
      const updatedList = meterDetails.map(item => item.id === editingDetails.id ? { ...item, ...values } : item);
      setMeterDetails(updatedList);
      showToast("Meter details updated successfully.", "success");
    } else {
      const newId = Math.max(...meterDetails.map(item => item.id)) + 1;
      setMeterDetails([...meterDetails, { ...values, id: newId }]);
      showToast("Meter details created successfully.", "success");
    }
    resetForm();
    setAddOpen(false);
  };

  const columns = useMemo(() => [
    { key: 'meter_serial', header: 'Meter Serial', field: InputField },
    { key: 'meter_name', header: 'Meter Name', field: InputField },
    { 
      key: 'type', 
      header: 'Type',
      field: SelectField,
      fieldProps: {
        options: [
          { label: "Primary", value: "primary" }, 
          { label: "Secondary", value: "secondary" }
        ]
      }
    },
    { key: 'phase', header: 'Phase', field: InputField },
    { key: 'datacenter_name', header: 'Datacenter', field: InputField },
    { key: 'installed_point', header: 'Installed Point', field: InputField },
    { key: 'power_source', header: 'Power Source', field: InputField },
    { key: 'phase_source', header: 'Phase Source', field: InputField },
    { key: 'customer', header: 'Customer', field: InputField },
    { key: 'billing_formula', header: 'Billing Formula', field: InputField },
    { key: 'threshold', header: 'Threshold', field: InputField },
    { key: 'grace_value', header: 'Grace Value', field: InputField },
    { key: 'rack', header: 'Rack', field: InputField },
    { 
      key: 'status', 
      header: 'Status',
      field: SelectField,
      fieldProps: {
        options: [
          { label: "Active", value: "active" }, 
          { label: "Inactive", value: "inactive" }
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
          <Button variant='icon' size="sm" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ], [handleEdit, handleDelete]);

  const filteredData = useMemo(() => {
    let result = meterDetails;
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(row =>
        columns.some(c =>
          String(row[c.key] ?? "").toLowerCase().includes(q)
        )
      );
    }
    
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([key, value]) => {
          if (key === 'status' || key === 'type') {
            return String(row[key]).toLowerCase() === String(value).toLowerCase();
          }
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [meterDetails, query, filters, columns]);

  if (addOpen) {
    return (
      <MeterDetailsForm
        initialValues={editingDetails}
        isEditMode={isEditMode}
        onSubmit={handleFormSubmit}
        onCancel={() => setAddOpen(false)}
      />
    );
  }

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Meter Details</h1>
          <p className="opacity-70">View and Manage the list of Meter Details.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton 
            data={meterDetails} 
            columns={columns} 
            fileName="meter-details" 
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
          <Button intent="primary" onClick={openNewForm} leftIcon={Plus}>
            Add Meter Details
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading meter details...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <DataTable
          title="Meter Details Records"
          data={filteredData}
          columns={columns}
          searchable={true}
          selection={true}
          showId={true}
          filterComponent={<FilterMenu columns={columns} onFilterChange={setFilters} />}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}