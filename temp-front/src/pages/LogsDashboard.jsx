import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import LogsChartView from '../components/logs/LogsChartView';
import LogsTableView from '../components/logs/LogsTableView';
import ToastContainer from '../components/ui/ToastContainer';
import { Sparkles, ArrowUp, ArrowDown, Minus, BarChart2, List } from 'lucide-react';

// --- Custom Hook to encapsulate all log fetching and state management ---
const useHistoricalLogs = (api) => {
  const [state, setState] = useState({
    combinedLogs: [],
    loading: true,
    error: null,
    filters: {
      meterId: null,
      startTime: '',
      endTime: '',
      limit: 100,
    }
  });

  const updateState = useCallback((newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  }, []);

  const fetchLogs = useCallback(async () => {
    updateState({ loading: true, error: null });
    const { meterId, limit } = state.filters;
    try {
      let rawData = [];
      if (meterId) {
        const result = await api.listCombinedLogsByMeter(String(meterId), limit);
        rawData = result?.readings || [];
      } else {
        rawData = await api.listCombinedLogsRecent(limit);
      }

      const aggregated = rawData.map(item => {
        const t1 = item?.topic1 ?? {};
        const t2 = item?.topic2 ?? {};
        return {
          ...t1,
          zygsz: t2.zygsz ?? t1.zygsz ?? null,
          meter_time: t1.meter_time ?? t1.time ?? t2.meter_time ?? t2.time ?? null,
        };
      }).sort((a, b) => new Date(b.meter_time) - new Date(a.meter_time));

      updateState({ combinedLogs: aggregated, loading: false });

    } catch (err) {
      console.error("Failed to fetch combined logs:", err);
      updateState({ error: "Failed to fetch log data. Please try again.", loading: false });
    }
  }, [api, state.filters, updateState]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = useCallback((newFilters) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  return { ...state, handleFilterChange };
};

// Helper function to calculate statistics, improving readability
const calculateStatistics = (logs) => {
  if (!logs || logs.length === 0) {
    return { min: null, max: null, avg: null };
  }

  const allValues = logs.flatMap(d => {
    const values = [];
    for (const key in d) {
      const value = d[key];
      const numValue = parseFloat(value);
      if (key !== 'id' && key !== 'meter_id' && key !== 'meter_time' && key !== '_source' && !isNaN(numValue)) {
          values.push(numValue);
      }
    }
    return values;
  });

  if (allValues.length === 0) {
    return { min: null, max: null, avg: null };
  }

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const sum = allValues.reduce((acc, val) => acc + val, 0);
  const avg = sum / allValues.length;

  return {
    min: min.toFixed(2),
    max: max.toFixed(2),
    avg: avg.toFixed(2)
  };
};

/**
 * Main dashboard for displaying and analyzing historical meter log data.
 */
export default function LogsDashboard() {
  const api = useFastApi();
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback((message, type) => {
    const newToast = { id: Date.now(), message, type };
    setToasts((currentToasts) => [...currentToasts, newToast]);
  }, []);

  const { combinedLogs, loading, error, handleFilterChange } = useHistoricalLogs(api);
  
  const statistics = useMemo(() => calculateStatistics(combinedLogs), [combinedLogs]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  const StatCard = ({ label, value, icon }) => (
    <div className="flex flex-col items-center p-4">
      <div className="p-3 bg-gray-100 rounded-full mb-2 text-blue-600 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <span className="text-gray-500 text-sm font-medium">{label}</span>
      <span className="font-bold text-xl mt-1 text-gray-800">{value}</span>
    </div>
  );

  const skeleton = (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-28 bg-gray-200 rounded-lg"></div>
        <div className="h-28 bg-gray-200 rounded-lg"></div>
        <div className="h-28 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-96 bg-gray-200 rounded-lg"></div>
      <div className="h-96 bg-gray-200 rounded-lg"></div>
    </div>
  );

  return (
    <div className='px-4 md:px-8 md:p-8 space-y-8'>
      <div className='flex flex-col sm:flex-row justify-between sm:items-center  sm:pb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Historical Logs Dashboard </h1>
          <p className="text-gray-500 mt-1">Analyze historical meter data from logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-16">{skeleton}</div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
          <p className="text-sm mt-2 text-gray-500">Please check your network connection and try again.</p>
        </div>
      ) : (
        combinedLogs.length > 0 ? (
          <>
            <div className="space-y-8">
              <LogsChartView
                combinedLogs={combinedLogs}
                onFilterChange={handleFilterChange}
              />

              <div className="flex justify-around items-center p-6 bg-white rounded-lg shadow-md">
                <StatCard label="Minimum Value" value={statistics.min || "N/A"} icon={<ArrowDown />} />
                <StatCard label="Maximum Value" value={statistics.max || "N/A"} icon={<ArrowUp />} />
                <StatCard label="Average Value" value={statistics.avg || "N/A"} icon={<Minus />} />
              </div>
              
              <LogsTableView combinedLogs={combinedLogs} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg font-medium">No historical logs available.</p>
            <p className="text-sm mt-2 text-gray-400">Please try a different filter or check the data source.</p>
          </div>
        )
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}