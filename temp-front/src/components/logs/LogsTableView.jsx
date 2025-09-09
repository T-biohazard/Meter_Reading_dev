import React, { useMemo, useState } from 'react';
import DataTable from '../table/DataTable';
import ExportButton from '../ui/ExportButton';
import { FaFileExcel } from 'react-icons/fa';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import FilterMenu from '../table/FilterMenu';
import { DateTime } from 'luxon';

/**
 * Component to display historical log data in a table format.
 */
export default function LogsTableView({ combinedLogs }) {
  const [filters, setFilters] = useState({});

  const columns = useMemo(() => [
    {
      key: 'meter_id',
      header: 'Meter ID',
      accessor: row => row.meter_id ?? 'N/A', // Using nullish coalescing for safety
    },
    {
      key: 'time',
      header: 'Log Time',
      accessor: row => new Date(row.meter_time).toLocaleString(),
    },
    { key: 'ua', header: 'Ua (V)', accessor: row => row.ua ?? 'N/A' },
    { key: 'ub', header: 'Ub (V)', accessor: row => row.ub ?? 'N/A' },
    { key: 'uc', header: 'Uc (V)', accessor: row => row.uc ?? 'N/A' },
    // **New Column for zygsz (Energy)**
    { key: 'zygsz', header: 'Energy (kWh)', accessor: row => row.zygsz ?? 'N/A' },
    { key: 'ia', header: 'Ia (A)', accessor: row => row.ia ?? 'N/A' },
    { key: 'ib', header: 'Ib (A)', accessor: row => row.ib ?? 'N/A' },
    { key: 'ic', header: 'Ic (A)', accessor: row => row.ic ?? 'N/A' },
    { key: 'u', header: 'U (V)', accessor: row => row.u ?? 'N/A' },
    { key: 'f', header: 'Freq (Hz)', accessor: row => row.f ?? 'N/A' },
    // Add other fields as needed for the table
  ], []);

  // Filter the data based on the local filters
  const filteredData = useMemo(() => {
    let result = combinedLogs;
    if (Object.keys(filters).length > 0) {
      result = result.filter(log => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          // The search logic can now be simplified as the data is flat
          return String(log[key] ?? '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }

    // Add debug log
    console.debug('[LogsTableView] rows:', result.length, 'first:', result[0]);

    return result;
  }, [combinedLogs, filters]);


  const filterableColumns = useMemo(() => [
    {
      key: 'meter_id',
      header: 'Meter ID',
      field: InputField,
    },
  ], []);

  return (
    <div className='mt-8'>
      <div className='flex justify-between items-center pb-4'>
        <div>
          <h2 className='text-xl font-bold'>Log Records</h2>
          <p className="opacity-70">Detailed records from all meter logs.</p>
        </div>
        <ExportButton
          data={filteredData}
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
        data={filteredData}
        columns={columns}
        searchable={true}
        selection={false}
        showId={true}
        filterComponent={<FilterMenu columns={filterableColumns} onFilterChange={setFilters} />}
      />
    </div>
  );
}