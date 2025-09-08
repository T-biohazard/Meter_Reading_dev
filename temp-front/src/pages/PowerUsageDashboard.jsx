import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import LogsChartView from '../components/logs/LogsChartView';
import LogsTableView from '../components/logs/LogsTableView';
import ToastContainer from '../components/ui/ToastContainer';
import SelectField from '../components/fields/SelectField';
import { Sparkles, BarChart2, List } from 'lucide-react';

// --- Start of Hook and Helper Functions ---
const aggregateLogs = (readings) => {
  if (!readings || !Array.isArray(readings)) return [];

  const aggregated = readings.map(item => {
    const t1 = item?.topic1 || {};
    const t2 = item?.topic2 || {};
    return {
      ...t1,
      zygsz: t2.zygsz ?? t1.zygsz ?? null,
      meter_time: t1.meter_time ?? t1.time ?? t2.meter_time ?? t2.time ?? null,
    };
  });

  return aggregated.sort((a, b) => new Date(b.meter_time) - new Date(a.meter_time));
};

const LOGS_LIMIT = 100;

const usePowerUsageData = (api) => {
  const [customerMappings, setCustomerMappings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [meterLogs, setMeterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mappings, allCustomers] = await Promise.all([
        api.listCustomerMappings(),
        api.listCustomers(),
      ]);

      setCustomerMappings(mappings);
      setCustomers(allCustomers);
      setSelectedCustomerId(allCustomers.length > 0 ? allCustomers[0].id : null);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load customer data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const fetchMeterLogs = useCallback(async (customerId, mappings) => {
    setLoading(true);
    setError(null);
    try {
      const mapping = mappings.find(m => m.customer_id === customerId);
      if (!mapping || !mapping.meter_id) {
        setMeterLogs([]);
        setError("No meter associated with this customer.");
        return;
      }

      const result = await api.listCombinedLogsByMeter(String(mapping.meter_id), LOGS_LIMIT);
      const aggregated = aggregateLogs(result?.readings);
      setMeterLogs(aggregated);
    } catch (err) {
      console.error("Failed to fetch meter logs:", err);
      setError("Failed to fetch meter data.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCustomerId && customerMappings.length > 0) {
      fetchMeterLogs(selectedCustomerId, customerMappings);
    }
  }, [selectedCustomerId, customerMappings, fetchMeterLogs]);

  const handleCustomerChange = useCallback((value) => {
    setSelectedCustomerId(value);
  }, []);

  return {
    customers,
    customerMappings,
    selectedCustomerId,
    meterLogs,
    loading,
    error,
    handleCustomerChange,
    fetchData,
  };
};

// --- End of Hook and Helper Functions ---

const TOAST_TIMEOUT = 5000;

const StatCard = ({ title, value, unit, truncate = false }) => (
  <div className="p-5 bg-white rounded-lg shadow-sm border border-gray-200">
    <h2 className="text-sm font-semibold text-gray-500 mb-1">{title}</h2>
    <p className={`text-lg font-bold text-gray-800 ${truncate ? 'truncate' : ''}`} title={truncate ? value : undefined}>
      {value} {unit}
    </p>
  </div>
);

const CardSkeleton = () => <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>;
const ChartSkeleton = () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>;

/**
 * Main dashboard for displaying power usage data mapped to customers.
 */
export default function PowerUsageDashboard() {
  const api = useFastApi();
  const { customers, customerMappings, selectedCustomerId, meterLogs, loading, error, handleCustomerChange } = usePowerUsageData(api);

  const [toasts, setToasts] = useState([]);

  // Use useCallback to memoize the function and prevent re-creation
  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);

    // Automatically remove the toast after a set duration
    setTimeout(() => {
      removeToast(id);
    }, TOAST_TIMEOUT);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (error) {
      addToast(error, 'error');
    }
  }, [error, addToast]);

  const customerOptions = useMemo(() => customers.map(c => ({
    label: c.customer || `Customer ID: ${c.id}`,
    value: c.id,
  })), [customers]);

  const selectedCustomerDetails = useMemo(() => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return null;
    const customerMeters = customerMappings.filter(m => m.customer_id === selectedCustomerId);
    return {
      name: customer.customer || `Customer ID: ${selectedCustomerId}`,
      id: customer.id,
      meterCount: customerMeters.length,
    };
  }, [customers, selectedCustomerId, customerMappings]);

  const selectedMeterId = useMemo(() => {
    const mapping = customerMappings.find(m => m.customer_id === selectedCustomerId);
    return mapping?.meter_id;
  }, [customerMappings, selectedCustomerId]);

  const totalUsage = useMemo(() => {
    if (!meterLogs || meterLogs.length === 0) {
      return "N/A";
    }
    const latestReading = meterLogs[0]?.zygsz;
    return latestReading ? parseFloat(latestReading).toFixed(2) : "N/A";
  }, [meterLogs]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
          <p className="text-sm mt-2 text-gray-500">Please check your network connection and try again.</p>
        </div>
      );
    }

    const hasCustomers = selectedCustomerId && selectedCustomerDetails;
    const hasLogs = meterLogs.length > 0;

    return (
      <div className="space-y-8">
        {hasCustomers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard title="Customer Name" value={selectedCustomerDetails.name} truncate />
            <StatCard title="Customer ID" value={selectedCustomerDetails.id} />
            <StatCard title="Meter ID" value={selectedMeterId || 'N/A'} />
            <StatCard title="Total Meters" value={selectedCustomerDetails.meterCount} />
            <StatCard title="Latest Usage" value={totalUsage} unit="kWh" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg font-medium">No customers found or mapped.</p>
            <p className="text-sm mt-2 text-gray-400">Please check your data source.</p>
          </div>
        )}

        {hasLogs ? (
          <>
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" aria-hidden="true" />
                Usage Trend
              </h3>
              <LogsChartView combinedLogs={meterLogs} />
            </div>
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <List className="w-5 h-5 mr-2" aria-hidden="true" />
                Detailed Logs
              </h3>
              <LogsTableView combinedLogs={meterLogs} />
            </div>
          </>
        ) : (
          hasCustomers && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-lg font-medium">No meter logs available for this customer.</p>
              <p className="text-sm mt-2 text-gray-400">It's possible this meter hasn't reported data yet.</p>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className='p-4 md:p-8 space-y-8'>
      <div className='flex flex-col sm:flex-row justify-between sm:items-center pb-4 sm:pb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Power Usage Dashboard</h1>
          <p className="text-gray-500 mt-1">Analyze power consumption for a specific customer.</p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-64">
          <SelectField
            options={customerOptions}
            value={selectedCustomerId}
            onChange={handleCustomerChange}
            placeholder="Select a customer"
            disabled={loading}
          />
        </div>
      </div>

      <div className="transition-opacity duration-500 ease-in-out">
        {renderContent()}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}