import DataTable from '../components/table/DataTable';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Button from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
// import UsageSummaryForm from '../components/forms/UsageSummaryForm';
import { FaFileExcel } from 'react-icons/fa';
import ExportButton from '../components/ui/ExportButton';
import FilterMenu from '../components/table/FilterMenu';
import InputField from '../components/fields/InputField';

/**
 * Usage Summary dashboard component (read-only).
 */
export default function UsageSummaryDashboard() {
  const [usageSummary, setUsageSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [filters, setFilters] = useState({});
  const [query, setQuery] = useState('');

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  };

  const fetchUsageSummary = useCallback(() => {
    setLoading(true);
    // Mock data based on the provided tables
    const mockData = [
      {
        id: 1,
        customer: "Customer A",
        total_racks: 5,
        threshold_kw: 100,
        total_consumption_kw: 120,
        extra_consumption_kw: 20
      },
      {
        id: 2,
        customer: "Customer B",
        total_racks: 3,
        threshold_kw: 60,
        total_consumption_kw: 55,
        extra_consumption_kw: 0
      },
      {
        id: 3,
        customer: "Customer C",
        total_racks: 8,
        threshold_kw: 150,
        total_consumption_kw: 180,
        extra_consumption_kw: 30
      },
    ];
    setUsageSummary(mockData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsageSummary();
  }, [fetchUsageSummary]);

  const columns = useMemo(() => [
    { key: 'customer', header: 'Customer', field: InputField },
    { key: 'total_racks', header: 'Total Racks', field: InputField },
    { key: 'threshold_kw', header: 'Threshold (kW)', field: InputField },
    { key: 'total_consumption_kw', header: 'Total Consumption (kW)', field: InputField },
    { key: 'extra_consumption_kw', header: 'Extra Consumption (kW)', field: InputField },
  ], []);

  const filteredData = useMemo(() => {
    let result = usageSummary;
    
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
          return String(row[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    return result;
  }, [usageSummary, query, filters, columns]);

  return (
    <div className=''>
      <div className='flex justify-between items-center pb-16'>
        <div>
          <h1 className='text-2xl font-bold'>Usage Summary</h1>
          <p className="opacity-70">View the summary of customer usage.</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButton 
            data={usageSummary} 
            columns={columns} 
            fileName="usage-summary" 
            intent="primary"
            leftIcon={FaFileExcel}
            className="text-white-500  bg-green-700 hover:bg-green-800 border-none"
          >
            Export
          </ExportButton>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <p>Loading summary...</p>
        </div>
      ) : (
        <DataTable
          title="Usage Summary Records"
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