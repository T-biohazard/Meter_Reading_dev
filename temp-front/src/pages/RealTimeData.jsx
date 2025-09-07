import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import Chart from '../components/charts/Chart';
import clsx from 'clsx';
import { useId } from 'react';
import InputField from '../components/fields/InputField';
import Button from '../components/ui/Button';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import SelectField from '../components/fields/SelectField';

/** ------------------------------
 * RadioGroup Component - Controlled
 * ------------------------------ */
const RadioGroup = ({
  name,
  label,
  options,
  className,
  optionClassName,
  disabled,
  value,
  onChange,
  ...rest
}) => {
  const id = useId();

  const normalizedOptions = useMemo(() => {
    return (options || []).map((o) => {
      if (typeof o === 'string' || typeof o === 'number') {
        return { label: String(o), value: o, disabled: false };
      }
      return {
        label: o.label,
        value: o.value,
        disabled: !!o.disabled,
      };
    });
  }, [options]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={clsx('form-control', className)} {...rest}>
      {label && (
        <label className="label cursor-default">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {normalizedOptions.map((option, index) => {
          const optionId = `${id}-${name}-${index}`;
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} className={clsx('flex-none', optionClassName)}>
              <label
                htmlFor={optionId}
                className={clsx(
                  'label cursor-pointer px-4 py-2 border rounded-lg transition-colors duration-200',
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={handleChange}
                  disabled={isDisabled}
                  className="hidden"
                />
                <span className="label-text font-medium">{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** ------------------------------
 * Fieldset Wrapper - Left-aligned
 * ------------------------------ */
const Fieldset = ({ legend, children, className = '' }) => {
  return (
    <div
      className={clsx(
        'relative border border-gray-200/80 rounded-2xl',
        'bg-white/90 backdrop-blur-sm',
        'p-5 flex flex-col justify-start items-start gap-3',
        'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]',
        className
      )}
    >
      <div
        className={clsx(
          'absolute -top-2 left-3',
          'px-2 text-[10px] font-semibold tracking-wide uppercase',
          'text-gray-500 bg-white',
          'rounded-md border border-gray-200/80',
          'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]'
        )}
        style={{ lineHeight: '18px' }}
      >
        {legend}
      </div>
      <div className="w-full flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  );
};

/** ------------------------------
 * Chart Options Form
 * ------------------------------ */
const ChartOptionsForm = ({ onApply, initialValues, dataColumns }) => {
  const [chartType, setChartType] = useState(initialValues.chartType);
  const [showPoints, setShowPoints] = useState(initialValues.showPoints);
  const [showLegend, setShowLegend] = useState(initialValues.showLegend);
  const [yAxisColumns, setYAxisColumns] = useState(initialValues.yAxisColumns);

  useEffect(() => {
    onApply({
      chartType,
      showPoints,
      showLegend,
      yAxisColumns,
    });
  }, [chartType, showPoints, showLegend, yAxisColumns, onApply]);

  const chartTypeOptions = [
    { label: 'Line Chart', value: 'line' },
    { label: 'Bar Chart', value: 'bar' },
  ];

  const allColumnsSelected = yAxisColumns.length === dataColumns.length;

  const handleToggleSelectAll = () => {
    setYAxisColumns(allColumnsSelected ? [] : dataColumns);
  };

  const handleColumnToggle = (column) => {
    const newSelection = yAxisColumns.includes(column)
      ? yAxisColumns.filter((c) => c !== column)
      : [...yAxisColumns, column];
    setYAxisColumns(newSelection);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Meter Parameters */}
      <Fieldset legend="meter parameters">
        <Button
          type="button"
          onClick={handleToggleSelectAll}
          toggled={allColumnsSelected}
        >
          Select All Parameters
        </Button>
        {dataColumns.map((column) => (
          <Button
            key={column}
            type="button"
            onClick={() => handleColumnToggle(column)}
            toggled={yAxisColumns.includes(column)}
          >
            {column.toUpperCase()}
          </Button>
        ))}
      </Fieldset>

      {/* Two-column row */}
      <div className="w-1/2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Chart Type */}
        <Fieldset legend="chart options">
          <div className="flex flex-col gap-2 pt-3">
            <RadioGroup
              name="chartType"
              label=""
              options={chartTypeOptions}
              value={chartType}
              onChange={setChartType}
            />
          </div>
        </Fieldset>

        {/* Right: Visual toggles */}
        <Fieldset legend="visual options">
          <div className="flex flex-row gap-2 pt-3">
            <Button
              type="button"
              onClick={() => setShowPoints(!showPoints)}
              toggled={showPoints}
            >
              {showPoints ? 'Hide Points' : 'Show Points'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowLegend(!showLegend)}
              toggled={showLegend}
            >
              {showLegend ? 'Hide Legend' : 'Show Legend'}
            </Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};

/** ------------------------------
 * Main RealTimeData Component
 * ------------------------------ */
export default function RealTimeData() {
  const api = useFastApi();
  const [meterReadings, setMeterReadings] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // State for selected IDs
  const [selectedDatacenterId, setSelectedDatacenterId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedMeterId, setSelectedMeterId] = useState(null);

  // All available options for the dropdowns
  const [datacenters, setDatacenters] = useState([]);
  const [meters, setMeters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMappings, setCustomerMappings] = useState([]);

  const [chartConfig, setChartConfig] = useState({
    yAxisColumns: ['ua', 'ub'],
    chartType: 'line',
    showPoints: true,
    showLegend: true,
    theme: 'light',
  });

  const generateDummyData = useCallback(() => {
    const dummyData = {
      topic1: {
        id: 0,
        meter_id: 'dummy',
        ua: 0,
        ub: 0,
        uc: 0,
        ia: 0,
        ib: 0,
        ic: 0,
        uab: 0,
        ubc: 0,
        uca: 0,
        pa: 0,
        pb: 0,
        pc: 0,
        pfa: 0,
        pfb: 0,
        pfc: 0,
        zglys: 0,
        f: 0,
        u: 0,
        i: 0,
        zyggl: 0,
        time: new Date().toISOString(),
        meter_time: new Date().toISOString(),
      },
      topic2: {
        id: 0,
        meter_id: 'dummy',
        zygsz: 0,
        time: new Date().toISOString(),
        meter_time: new Date().toISOString(),
      },
    };
    return [dummyData];
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const allDatacenters = await api.listDatacenters();
      const allMeters = await api.listMeters();
      const allCustomers = await api.listCustomers();
      const allCustomerMappings = await api.listCustomerMappings();
      
      setDatacenters(allDatacenters);
      setMeters(allMeters);
      setCustomers(allCustomers);
      setCustomerMappings(allCustomerMappings);

      const firstMeter = allMeters?.[0];
      if (firstMeter) {
        setSelectedMeterId(firstMeter.id);
      } else {
        setInitialLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setInitialLoading(false);
    }
  }, [api]);

  const fetchMeterReadings = useCallback(async () => {
    if (!selectedMeterId) {
      setInitialLoading(false);
      return;
    }

    try {
      const data = await api.listCombinedReadingsByMeter(selectedMeterId, 10);
      const readingsArray = data?.readings || [];
      setMeterReadings(readingsArray);
      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to fetch meter readings:', error);
      setMeterReadings([]);
      setInitialLoading(false);
    }
  }, [api, selectedMeterId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedMeterId) {
      fetchMeterReadings();
      const intervalId = setInterval(() => {
        fetchMeterReadings();
      }, 30000);
      return () => clearInterval(intervalId);
    }
  }, [selectedMeterId, fetchMeterReadings]);

  const handleOptionsApply = useCallback((values) => {
    setChartConfig((prev) => ({ ...prev, ...values }));
  }, []);

  // 👈 SIMPLIFIED handleFilterChange
  const handleFilterChange = useCallback((newFilters) => {
    setSelectedDatacenterId(newFilters.datacenterId);
    setSelectedCustomerId(newFilters.customerId);
    setSelectedMeterId(newFilters.meterId);
    setMeterReadings([]); // Clear chart data immediately
  }, []);

  const dataColumns = useMemo(() => {
    const columns = [
      'ua',
      'ub',
      'uc',
      'ia',
      'ib',
      'ic',
      'uab',
      'ubc',
      'uca',
      'pa',
      'pb',
      'pc',
      'pfa',
      'pfb',
      'pfc',
      'zglys',
      'f',
      'u',
      'i',
      'zyggl',
      'zygsz',
    ];
    return columns;
  }, []);

  // Fixed filterableColumns with proper cascading and name-to-number mapping
  const filterableColumns = useMemo(() => {
    // 1. Datacenter filter options (all datacenters)
    const datacenterOptions = datacenters.map((dc) => ({
      label: dc.datacenter_name, // Descriptive name
      value: dc.id,              // Numeric ID
    }));

    // 2. Customer filter options (filtered by selected datacenter)
    const customerOptions = customers
      .filter((cust) => {
        if (!selectedDatacenterId) {
          return true; // Show all customers if no datacenter is selected
        }
        // Filter customers who have a meter in the selected datacenter
        return customerMappings.some(
          (mapping) =>
            mapping.customer_id === cust.id &&
            meters.some(
              (meter) =>
                meter.id === mapping.meter_id &&
                meter.datacenter_id === selectedDatacenterId
            )
        );
      })
      .map((cust) => ({
        label: cust.customer, // Descriptive name
        value: cust.id,       // Numeric ID
      }));

    // 3. Meter filter options (filtered by selected datacenter and customer)
    const meterOptions = meters
      .filter((meter) => {
        const datacenterMatch = selectedDatacenterId
          ? meter.datacenter_id === selectedDatacenterId
          : true;
        
        const customerMatch = selectedCustomerId
          ? customerMappings.some(
              (mapping) =>
                mapping.meter_id === meter.id &&
                mapping.customer_id === selectedCustomerId
            )
          : true;
        
        return datacenterMatch && customerMatch;
      })
      .map((meter) => ({
        label: meter.serial, // Descriptive name (serial number)
        value: meter.id,     // Numeric ID
      }));

    return [
      {
        key: 'datacenterId',
        header: 'Datacenter',
        field: SelectField,
        fieldProps: {
          
          options: datacenterOptions,
          searchable: true,
          value: selectedDatacenterId,
        },
      },
      {
        key: 'customerId',
        header: 'Customer',
        field: SelectField,
        fieldProps: {
          
          options: customerOptions,
          searchable: true,
          value: selectedCustomerId,
          disabled: !selectedDatacenterId, // Disable if no datacenter selected
        },
      },
      {
        key: 'meterId',
        header: 'Meter ID',
        field: SelectField,
        fieldProps: {
        
          options: meterOptions,
          searchable: true,
          value: selectedMeterId,
          disabled: !selectedCustomerId, // Disable if no customer selected
        },
      },
    ];
  }, [
    datacenters,
    customers,
    meters,
    customerMappings,
    selectedDatacenterId,
    selectedCustomerId,
    selectedMeterId,
  ]);

  const chartData = useMemo(() => {
    const displayData = initialLoading ? generateDummyData() : meterReadings;

    const filteredData = displayData;

    const datasets = chartConfig.yAxisColumns.map((col, index) => {
      const data = filteredData.map((d) =>
        d.topic1?.[col] !== undefined ? d.topic1[col] : d.topic2?.[col]
      );
      const hue = (360 / chartConfig.yAxisColumns.length) * index;
      const color = `hsl(${hue}, 70%, 50%)`;

      return {
        label: col.toUpperCase(),
        data: data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: chartConfig.showPoints ? 3 : 0,
        pointHoverRadius: chartConfig.showPoints ? 5 : 0,
      };
    });

    return {
      labels: filteredData.map((d) =>
        new Date(d.topic1?.meter_time || d.topic2?.meter_time).toLocaleTimeString()
      ),
      datasets: datasets,
    };
  }, [initialLoading, meterReadings, chartConfig, generateDummyData]);

  return (
    <div className="px-2 py-1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Real-Time Meter Readings</h1>
          <p className="opacity-70">Visualize Real Time data from meters</p>
        </div>
      </div>
      <div className="bg-white rounded-lg py-12 shadow-md h-[600px]">
        <Chart
          type={chartConfig.chartType}
          data={chartData}
          options={{
            plugins: {
              legend: {
                display: chartConfig.showLegend,
                position: 'bottom',
              },
            },
          }}
          allowZoomAndPan={true}
          theme={chartConfig.theme}
          chartOptionsComponent={
            <ChartOptionsForm
              onApply={handleOptionsApply}
              initialValues={chartConfig}
              dataColumns={dataColumns}
            />
          }
          filterColumns={filterableColumns}
          onFilterChange={handleFilterChange}
          // 👈 YOU NEED THIS PROP NAME
          filterMenuProps={{ live: true }}
          initialLoading={initialLoading}
        />
      </div>
    </div>
  );
}