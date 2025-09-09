import React, { useMemo, useState, useCallback } from 'react';
import DataTable from '../table/DataTable';
import ExportButton from '../ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import Button from '../ui/Button';
import { DateTime } from 'luxon';

/**
 * Component to display historical log data in a table format.
 */
export default function LogsTableView({
  combinedLogs,
  customers,
  customerMappings,
  selectedCustomerId,
  handleCustomerChange,
  selectedMeterIds,
  setSelectedMeterIds,
  dateRange,
  setDateRange,
  loading
}) {
  const data = useMemo(() => combinedLogs, [combinedLogs]);

  const columns = useMemo(() => [
    {
      key: 'meter_id',
      header: 'Meter ID',
      accessor: row => row.meter_id ?? 'N/A',
    },
    {
      key: 'time',
      header: 'Log Time',
      accessor: row => new Date(row.meter_time).toLocaleString(),
    },
    { key: 'ua', header: 'Ua (V)', accessor: row => row.ua ?? 'N/A' },
    { key: 'ub', header: 'Ub (V)', accessor: row => row.ub ?? 'N/A' },
    { key: 'uc', header: 'Uc (V)', accessor: row => row.uc ?? 'N/A' },
    { key: 'zygsz', header: 'Energy (kWh)', accessor: row => row.zygsz ?? 'N/A' },
    { key: 'ia', header: 'Ia (A)', accessor: row => row.ia ?? 'N/A' },
    { key: 'ib', header: 'Ib (A)', accessor: row => row.ib ?? 'N/A' },
    { key: 'ic', header: 'Ic (A)', accessor: row => row.ic ?? 'N/A' },
    { key: 'u', header: 'U (V)', accessor: row => row.u ?? 'N/A' },
    { key: 'f', header: 'Freq (Hz)', accessor: row => row.f ?? 'N/A' },
  ], []);

  // **New: Create the filter menu component content dynamically based on props**
  const FilterMenuContent = useCallback(() => {
    const customerOptions = customers.map(c => ({
      label: c.customer || `Customer ID: ${c.id}`,
      value: c.id,
    }));
    
    const metersForSelectedCustomer = customerMappings
      .filter(m => m.customer_id === selectedCustomerId)
      .map(m => m.meter_id);

    const handleSelectAllMeters = (checked) => {
      if (checked) {
          setSelectedMeterIds(metersForSelectedCustomer);
      } else {
          setSelectedMeterIds([]);
      }
    };

    const handleIndividualMeterChange = (meterId, checked) => {
      if (checked) {
        setSelectedMeterIds(prev => [...prev, meterId]);
      } else {
        setSelectedMeterIds(prev => prev.filter(id => id !== meterId));
      }
    };

    const handleDateChange = (type) => (e) => {
      setDateRange(prev => ({ ...prev, [type]: e.target.value ? new Date(e.target.value) : null }));
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-100 rounded-lg shadow-inner mb-8">
        {/* Customer Selection */}
        <div className="w-full sm:w-1/3">
          <SelectField
            label="Customer"
            options={customerOptions}
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            placeholder="Select a customer"
            disabled={loading}
          />
        </div>

        {/* Meter Selection */}
        <div className="w-full sm:w-1/3">
          <div className="text-sm font-medium text-gray-700 mb-1">Meters</div>
          <div className="bg-white p-2 rounded-md shadow-sm border border-gray-300 max-h-40 overflow-y-auto">
            {selectedCustomerId && metersForSelectedCustomer.length > 0 ? (
                <>
                    <Button type="button" onClick={() => handleSelectAllMeters(selectedMeterIds.length !== metersForSelectedCustomer.length)} toggled={selectedMeterIds.length === metersForSelectedCustomer.length}>
                      Select All
                    </Button>
                    <hr className="my-2 border-gray-200" />
                    {metersForSelectedCustomer.map(meterId => (
                        <Button key={meterId} type="button" onClick={() => handleIndividualMeterChange(meterId, !selectedMeterIds.includes(meterId))} toggled={selectedMeterIds.includes(meterId)}>
                          {meterId}
                        </Button>
                    ))}
                </>
            ) : (
                <p className="text-gray-500 text-sm">No meters available.</p>
            )}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="w-full sm:w-1/3 flex flex-col gap-2">
            <InputField 
              label="Start Time"
              type="datetime-local"
              value={dateRange.startDate ? dateRange.startDate.toISOString().slice(0, 16) : ''}
              onChange={handleDateChange('startDate')}
            />
            <InputField 
              label="End Time"
              type="datetime-local"
              value={dateRange.endDate ? dateRange.endDate.toISOString().slice(0, 16) : ''}
              onChange={handleDateChange('endDate')}
            />
        </div>
      </div>
    );
  }, [customers, customerMappings, selectedCustomerId, handleCustomerChange, selectedMeterIds, setSelectedMeterIds, dateRange, setDateRange, loading]);


  return (
    <div className='mt-8'>
      <div className='flex justify-between items-center pb-4'>
        <div>
          <h2 className='text-xl font-bold'>Log Records</h2>
          <p className="opacity-70">Detailed records from all meter logs.</p>
        </div>
        <ExportButton
          data={data}
          columns={columns}
          fileName="meter_logs"
          intent="primary"
          leftIcon={FaFileExcel}
          className="text-white-500 bg-green-700 hover:bg-green-800 border-none"
        >
          Export
        </ExportButton>
      </div>
      <DataTable
        title="Log Records"
        data={data}
        columns={columns}
        searchable={true}
        selection={false}
        showId={true}
        filterMenuComponent={FilterMenuContent}
      />
    </div>
  );
}