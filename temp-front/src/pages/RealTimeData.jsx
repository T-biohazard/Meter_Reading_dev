import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Chart from '../components/charts/Chart';
import clsx from 'clsx';
import { useId } from 'react';
import InputField from '../components/fields/InputField';
import Button from '../components/ui/Button';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';

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
    return (options || []).map(o => {
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
            <div key={option.value} className={clsx("flex-none", optionClassName)}>
              <label 
                htmlFor={optionId}
                className={clsx(
                  'label cursor-pointer px-4 py-2 border rounded-lg transition-colors duration-200',
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
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
        className,
      )}
    >
      <div
        className={clsx(
          'absolute -top-2 left-3',
          'px-2 text-[10px] font-semibold tracking-wide uppercase',
          'text-gray-500 bg-white',
          'rounded-md border border-gray-200/80',
          'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]',
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
  const [filters, setFilters] = useState({});

  const [chartConfig, setChartConfig] = useState({
    yAxisColumns: ['ua', 'ub'],
    chartType: 'line',
    timeSpan: 10,
    showPoints: true,
    showLegend: true,
    theme: 'light',
  });

  const fetchMeterReadings = useCallback(async () => {
    try {
      const data = await api.listMeterReadings(0, chartConfig.timeSpan);
      setMeterReadings(data);
    } catch (error) {
      console.error('Failed to fetch meter readings:', error);
    }
  }, [api, chartConfig.timeSpan]);

  useEffect(() => {
    fetchMeterReadings();
    const intervalId = setInterval(() => {
      fetchMeterReadings();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchMeterReadings]);

  const handleOptionsApply = useCallback((values) => {
    setChartConfig((prev) => ({ ...prev, ...values }));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const dataColumns = useMemo(() => {
    if (meterReadings.length === 0) return [];
    const firstRow = meterReadings[0];
    const excluded = [
      'id',
      'meter_id',
      'time',
      'meter_time',
      'datacenter_name',
      'customer_name',
      'meter_serial',
      'phase',
      'installed_point',
    ];
    return Object.keys(firstRow).filter((key) => !excluded.includes(key));
  }, [meterReadings]);

  const filterableColumns = useMemo(() => {
    const specialFilters = [
      {
        key: 'datacenter_name',
        header: 'Datacenter',
        field: InputField,
        fieldProps: { placeholder: 'Filter by Datacenter' },
      },
      {
        key: 'customer_name',
        header: 'Customer',
        field: InputField,
        fieldProps: { placeholder: 'Filter by Customer' },
      },
      {
        key: 'meter_serial',
        header: 'Meter Serial',
        field: InputField,
        fieldProps: { placeholder: 'Filter by Meter Serial' },
      },
      {
        key: 'phase',
        header: 'Phase',
        field: InputField,
        fieldProps: { placeholder: 'Filter by Phase' },
      },
      {
        key: 'installed_point',
        header: 'Installed Point',
        field: InputField,
        fieldProps: { placeholder: 'Filter by Installed Point' },
      },
    ];
    const meterReadingsColumns = dataColumns.map((col) => ({
      key: col,
      header: col.toUpperCase(),
      field: InputField,
      fieldProps: {
        type: 'text',
        placeholder: `Filter by ${col.toUpperCase()}`,
      },
    }));
    return [...specialFilters, ...meterReadingsColumns];
  }, [dataColumns]);

  const chartData = useMemo(() => {
    const limitedData = meterReadings;

    const filteredData = limitedData.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = String(row[key] || '').toLowerCase();
        return rowValue.includes(String(value).toLowerCase());
      });
    });

    const datasets = chartConfig.yAxisColumns.map((col, index) => {
      const data = filteredData.map((d) => d[col]);
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
        new Date(d.meter_time).toLocaleTimeString()
      ),
      datasets: datasets,
    };
  }, [meterReadings, chartConfig, filters]);

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
        />
      </div>
    </div>
  );
}