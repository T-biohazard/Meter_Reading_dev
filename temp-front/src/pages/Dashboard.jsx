import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import Chart from '../components/charts/Chart';
import DataTable from '../components/table/DataTable';
import { BarChart2, List, MapPin, Gauge, CheckCircle, XCircle, Users, Layers, Zap, TrendingUp, PieChart } from 'lucide-react';

// Reusable UI Components
const StatCard = ({ title, value, icon, truncate = false }) => (
  <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 flex items-center">
    <div className="p-3 mr-4 rounded-full bg-blue-100 text-blue-600">
      {icon}
    </div>
    <div>
      <h2 className="text-sm font-semibold text-gray-500 mb-1">{title}</h2>
      <p className={`text-xl font-bold text-gray-800 ${truncate ? 'truncate' : ''}`} title={truncate ? value : undefined}>
      {value}
      </p>
    </div>
  </div>
);

const CardSkeleton = () => <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>;
const ChartSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;
const TableSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;

// Helper to aggregate and enrich data from multiple API calls
const aggregateReadingsData = (datacenters, meters, mappings, combinedReadings, racks, customers) => {
  const dcMap = new Map(datacenters.map(dc => [dc.id, dc.datacenter_name]));
  const meterMap = new Map(meters.map(m => [m.id, m]));
  const mappingMap = new Map(mappings.map(m => [m.meter_id, m.customer_id]));
  const customerNameMap = new Map(customers.map(c => [c.id, c.customer]));
  const rackMap = new Map(racks.map(r => [r.id, r.rack_name]));

  if (!Array.isArray(combinedReadings)) {
    console.warn("API returned no combined readings data.");
    return [];
  }

  const combined = [];
  combinedReadings.forEach(item => {
    const t1 = item?.topic1 ?? {};
    const t2 = item?.topic2 ?? {};
    
    const meter_id_t1 = String(t1.meter_id);
    const meter_id_t2 = String(t2.meter_id);
    const meterId = meter_id_t2 || meter_id_t1;

    if (!meterId || isNaN(parseInt(meterId))) return;

    const meter = meterMap.get(parseInt(meterId));
    const datacenterName = meter ? dcMap.get(meter.datacenter_id) || 'Unknown Site' : 'Unknown Site';
    
    // Correctly map customer_id to customer name
    const customerId = mappingMap.get(parseInt(meterId)) || null;
    const customerName = customerId ? customerNameMap.get(customerId) || 'N/A' : 'N/A';
    
    // Correctly map rack_id to rack name
    const rackId = meter ? meter.rack_id || null : null;
    const rackName = rackId ? rackMap.get(rackId) || 'N/A' : 'N/A';
    
    // Safely parse power values and calculate p_total
    const pa = parseFloat(t1.pa);
    const pb = parseFloat(t1.pb);
    const pc = parseFloat(t1.pc);
    const p_total = (pa + pb + pc).toFixed(2);
    
    const reading = {
      meter_time: t2.meter_time || t2.time || t1.meter_time || t1.time,
      meter_id: meterId,
      datacenterName,
      customerName,
      rackName,
      zygsz: t2.zygsz !== undefined ? parseFloat(t2.zygsz) : 0,
      u_a: t1.ua !== undefined ? parseFloat(t1.ua).toFixed(2) : 'N/A',
      u_b: t1.ub !== undefined ? parseFloat(t1.ub).toFixed(2) : 'N/A',
      u_c: t1.uc !== undefined ? parseFloat(t1.uc).toFixed(2) : 'N/A',
      i_a: t1.ia !== undefined ? parseFloat(t1.ia).toFixed(2) : 'N/A',
      i_b: t1.ib !== undefined ? parseFloat(t1.ib).toFixed(2) : 'N/A',
      i_c: t1.ic !== undefined ? parseFloat(t1.ic).toFixed(2) : 'N/A',
      p_total: isNaN(p_total) ? 'N/A' : p_total,
    };

    if (reading.meter_time && !isNaN(reading.zygsz)) {
      combined.push(reading);
    }
  });

  return combined.sort((a, b) => new Date(b.meter_time) - new Date(a.meter_time));
};

export default function Dashboard() {
  const api = useFastApi();
  const [combinedData, setCombinedData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [meters, setMeters] = useState([]);
  const [racks, setRacks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [datacenters, metersData, mappings, combinedReadings, racksData, customersData] = await Promise.all([
          api.listDatacenters(),
          api.listMeters(),
          api.listCustomerMappings(),
          api.listCombinedReadingsRecent(100),
          api.listRacks(),
          api.listCustomers(),
        ]);
        
        setMeters(metersData);
        setRacks(racksData);
        setCustomers(customersData);
        const aggregated = aggregateReadingsData(datacenters, metersData, mappings, combinedReadings, racksData, customersData);
        setCombinedData(aggregated);
        setTableData(aggregated);
      } catch (error) {
        console.error("Failed to fetch fleet data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [api]);

  // --- Dashboard Metrics (reactive to active filter) ---
  const dashboardMetrics = useMemo(() => {
    const src = activeFilter
      ? combinedData.filter(r => r.datacenterName === activeFilter || r.customerName === activeFilter || r.rackName === activeFilter)
      : combinedData;

    const totalReadings = src.length;
    const totalUniqueMeters = new Set(src.map(d => d.meter_id)).size;
    const totalUniqueSites = new Set(src.map(d => d.datacenterName)).size;
    const totalUniqueCustomers = new Set(src.map(d => d.customerName)).size;
    const totalUniqueRacks = new Set(src.map(d => d.rackName)).size;
    const latestUsage = totalReadings > 0 ? src[0].zygsz.toFixed(2) : 'N/A';
    
    const meterIdsInView = new Set(src.map(r => parseInt(r.meter_id, 10)));
    const relevantMeters = activeFilter
      ? meters.filter(m => meterIdsInView.has(m.id))
      : meters;

    const totalMeters   = relevantMeters.length;
    const activeMeters  = relevantMeters.filter(m => m.status === 'active').length;
    const inactiveMeters= relevantMeters.filter(m => m.status === 'inactive').length;

    return {
      totalReadings,
      totalUniqueMeters,
      totalUniqueSites,
      totalUniqueCustomers,
      totalUniqueRacks,
      latestUsage,
      totalMeters,
      activeMeters,
      inactiveMeters,
    };
  }, [combinedData, meters, activeFilter]);

  // --- Chart Data (Memoized) ---
  const metersBySiteChartData = useMemo(() => {
    const siteCounts = combinedData.reduce((acc, item) => {
      acc[item.datacenterName] = (acc[item.datacenterName] || 0) + 1;
      return acc;
    }, {});
    
    const labels = Object.keys(siteCounts);
    const data = Object.values(siteCounts);
    
    return {
      labels,
      datasets: [{
        label: 'Meters by Site',
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(244, 63, 94, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: 'white',
        borderWidth: 2,
      }],
    };
  }, [combinedData]);

  const topMetersChartData = useMemo(() => {
    const meterAggregates = combinedData.reduce((acc, reading) => {
      if (!acc[reading.meter_id]) {
        acc[reading.meter_id] = { total_zygsz: 0, count: 0 };
      }
      acc[reading.meter_id].total_zygsz += reading.zygsz;
      acc[reading.meter_id].count += 1;
      return acc;
    }, {});
  
    const sortedMeters = Object.keys(meterAggregates)
      .map(meter_id => ({
        meter_id,
        avg_zygsz: (meterAggregates[meter_id].total_zygsz / meterAggregates[meter_id].count),
      }))
      .sort((a, b) => b.avg_zygsz - a.avg_zygsz)
      .slice(0, 5);
  
    return {
      labels: sortedMeters.map(item => item.meter_id),
      datasets: [
        {
          label: 'Average Energy Usage (kWh)',
          data: sortedMeters.map(item => item.avg_zygsz),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [combinedData]);

  const topCustomersChartData = useMemo(() => {
    const customerAggregates = combinedData.reduce((acc, reading) => {
      const customerName = reading.customerName || 'N/A';
      if (!acc[customerName]) {
        acc[customerName] = { total_zygsz: 0 };
      }
      acc[customerName].total_zygsz += reading.zygsz;
      return acc;
    }, {});
  
    const sortedCustomers = Object.keys(customerAggregates)
      .map(customerName => ({
        customerName,
        total_zygsz: customerAggregates[customerName].total_zygsz,
      }))
      .sort((a, b) => b.total_zygsz - a.total_zygsz)
      .slice(0, 5);
  
    return {
      labels: sortedCustomers.map(item => item.customerName),
      datasets: [
        {
          label: 'Total Energy Usage (kWh)',
          data: sortedCustomers.map(item => item.total_zygsz),
          backgroundColor: 'rgba(245, 158, 11, 0.6)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [combinedData]);

  const powerLoadByRackChartData = useMemo(() => {
    const rackAggregates = combinedData.reduce((acc, reading) => {
      const rack = reading.rackName || 'N/A';
      if (!acc[rack]) {
        acc[rack] = { total_power: 0, count: 0 };
      }
      const powerValue = parseFloat(reading.p_total);
      if (!isNaN(powerValue)) {
        acc[rack].total_power += powerValue;
        acc[rack].count += 1;
      }
      return acc;
    }, {});
  
    const sortedRacks = Object.keys(rackAggregates)
      .filter(rack => rackAggregates[rack].count > 0)
      .map(rackName => ({
        rackName,
        avg_power: rackAggregates[rackName].total_power / rackAggregates[rackName].count,
      }))
      .sort((a, b) => b.avg_power - a.avg_power);
  
    return {
      labels: sortedRacks.map(item => item.rackName),
      datasets: [{
        label: 'Average Power (kW)',
        data: sortedRacks.map(item => item.avg_power),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      }],
    };
  }, [combinedData]);

  const recentPowerTrendChartData = useMemo(() => {
    const sortedData = [...combinedData].sort((a, b) => new Date(a.meter_time) - new Date(b.meter_time));
    const limitedData = sortedData.slice(-20); // Show last 20 readings for a clear trend
    
    return {
      labels: limitedData.map(item => new Date(item.meter_time).toLocaleTimeString()),
      datasets: [{
        label: 'Recent Total Power (kW)',
        data: limitedData.map(item => parseFloat(item.p_total)),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: false,
      }],
    };
  }, [combinedData]);

  const activeMeterStatusChartData = useMemo(() => {
    const activeCount = meters.filter(m => m.status === 'active').length;
    const inactiveCount = meters.filter(m => m.status === 'inactive').length;
    
    return {
      labels: ['Active', 'Inactive'],
      datasets: [{
        label: 'Meter Status',
        data: [activeCount, inactiveCount],
        backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(244, 63, 94, 0.6)'],
        hoverOffset: 4,
      }],
    };
  }, [meters]);

  // --- Interaction Handlers ---
  const handleChartClick = useCallback((type) => ({ label }) => {
    let filteredRows;
    if (type === 'site') {
      filteredRows = combinedData.filter(row => row.datacenterName === label);
    } else if (type === 'top_meters') {
      filteredRows = combinedData.filter(row => row.meter_id === label);
    } else if (type === 'customer') {
      filteredRows = combinedData.filter(row => row.customerName === label);
    } else if (type === 'rack') {
      filteredRows = combinedData.filter(row => row.rackName === label);
    } else if (type === 'status') {
      // Logic for the status chart: filter based on meter status
      const relevantMeters = meters.filter(m => m.status.toLowerCase() === label.toLowerCase());
      const relevantMeterIds = new Set(relevantMeters.map(m => m.id.toString()));
      filteredRows = combinedData.filter(row => relevantMeterIds.has(row.meter_id));
    }
    
    setTableData(filteredRows);
    setActiveFilter(label);
  }, [combinedData, meters]);

  const handleClearFilter = useCallback(() => {
    setTableData(combinedData);
    setActiveFilter(null);
  }, [combinedData]);

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-extrabold mb-4 text-center md:text-left">
        Interactive Fleet Dashboard
      </h1>
      <p className="text-gray-500 mb-8 text-center md:text-left">
        Click on a chart to filter the data.
      </p>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {isLoading ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Total Meters" value={dashboardMetrics.totalMeters} icon={<Gauge size={24} />} />
            <StatCard title="Active Meters" value={dashboardMetrics.activeMeters} icon={<CheckCircle size={24} />} />
            <StatCard title="Inactive Meters" value={dashboardMetrics.inactiveMeters} icon={<XCircle size={24} />} />
            <StatCard title="Active Customers" value={dashboardMetrics.totalUniqueCustomers} icon={<Users size={24} />} />
            <StatCard title="Total Racks" value={dashboardMetrics.totalUniqueRacks} icon={<Layers size={24} />} />
            <StatCard title="Latest Usage" value={`${dashboardMetrics.latestUsage} kWh`} icon={<BarChart2 size={24} />} />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <>
            <ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
          </>
        ) : (
          <>
            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Meters by Site Chart">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2" aria-hidden="true" />
                Meters by Site
              </h2>
              <Chart
                type="pie"
                data={metersBySiteChartData}
                onClick={handleChartClick('site')}
              />
            </div>
            
            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Top 5 Meters by Average Usage">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" aria-hidden="true" />
                Top 5 Meters
              </h2>
              <Chart
                type="bar"
                data={topMetersChartData}
                onClick={handleChartClick('top_meters')}
              />
            </div>

            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Top 5 Customers by Energy Usage">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" aria-hidden="true" />
                Top 5 Customers
              </h2>
              <Chart
                type="bar"
                data={topCustomersChartData}
                onClick={handleChartClick('customer')}
              />
            </div>

            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Average Power by Rack Chart">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2" aria-hidden="true" />
                Average Power by Rack
              </h2>
              <Chart
                type="bar"
                data={powerLoadByRackChartData}
                onClick={handleChartClick('rack')}
              />
            </div>

            {/* NEW: Line Graph */}
            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Recent Power Trend">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
                Recent Power Trend
              </h2>
              <Chart
                type="line"
                data={recentPowerTrendChartData}
                // Line charts don't typically filter the table by a single point, so we'll omit the onClick handler
              />
            </div>

            {/* NEW: Doughnut Chart */}
            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Meter Status Doughnut Chart">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <PieChart className="w-5 h-5 mr-2" aria-hidden="true" />
                Meter Status
              </h2>
              <Chart
                type="doughnut"
                data={activeMeterStatusChartData}
                onClick={handleChartClick('status')}
              />
            </div>
          </>
        )}
      </div>

      {/* Data Table Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Detailed Readings {activeFilter && `(Filtered by: ${activeFilter})`}</h2>
              {activeFilter && (
                <button onClick={handleClearFilter} className="text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200" aria-label="Clear all filters">
                  Clear Filter
                </button>
              )}
            </div>
            <DataTable
              title="Readings"
              data={tableData}
              columns={[
                { key: 'meter_time', header: 'Timestamp' },
                { key: 'datacenterName', header: 'Site' },
                { key: 'rackName', header: 'Rack' },
                { key: 'meter_id', header: 'Meter ID' },
                { key: 'customerName', header: 'Customer' },
                { key: 'zygsz', header: 'Energy (kWh)' },
                { key: 'p_total', header: 'Power (kW)'},
                { key: 'u_a', header: 'Ua (V)'},
                { key: 'u_b', header: 'Ub (V)'},
                { key: 'u_c', header: 'Uc (V)'},
                { key: 'i_a', header: 'Ia (A)'},
                { key: 'i_b', header: 'Ib (A)'},
                { key: 'i_c', header: 'Ic (A)'},
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}