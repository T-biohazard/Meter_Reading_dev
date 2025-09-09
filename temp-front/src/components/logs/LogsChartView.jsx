import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Chart from '../charts/Chart';
import { useFastApi } from '../../hooks/fastapihooks/fastapihooks';
import InputField from '../fields/InputField';
import SelectField from '../fields/SelectField';
import Button from '../ui/Button';
import { SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { useId } from 'react';

// Reusable Fieldset and RadioGroup components
const RadioGroup = ({ name, label, options, className, optionClassName, disabled, value, onChange, ...rest }) => {
  const id = useId();
  const normalizedOptions = useMemo(() => {
    return (options || []).map((o) => {
      if (typeof o === 'string' || typeof o === 'number') {
        return { label: String(o), value: o, disabled: false };
      }
      return { label: o.label, value: o.value, disabled: !!o.disabled };
    });
  }, [options]);
  const handleChange = (e) => onChange(e.target.value);
  return (
    <div className={clsx('form-control', className)} {...rest}>
      {label && <label className="label cursor-default"><span className="label-text font-medium">{label}</span></label>}
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
                  isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
                  isDisabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input id={optionId} type="radio" name="name" value={option.value} checked={isSelected} onChange={handleChange} disabled={isDisabled} className="hidden" />
                <span className="label-text font-medium">{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const Fieldset = ({ legend, children, className = '' }) => {
  return (
    <div className={clsx('relative border border-gray-200/80 rounded-2xl', 'bg-white/90 backdrop-blur-sm', 'p-5 flex flex-col justify-start items-start gap-3', 'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]', className)}>
      <div className={clsx('absolute -top-2 left-3', 'px-2 text-[10px] font-semibold tracking-wide uppercase', 'text-gray-500 bg-white', 'rounded-md border border-gray-200/80', 'shadow-[0_1px_0_0_rgba(0,0,0,0.02)]')} style={{ lineHeight: '18px' }}>
        {legend}
      </div>
      <div className="w-full flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
};

/** ------------------------------
 * Chart Options Form for Logs
 * ------------------------------ */
const ChartOptionsForm = ({ onApply, initialValues, dataColumns }) => {
  const [chartConfig, setChartConfig] = useState(initialValues);

  const handleChange = useCallback((key, value) => {
    setChartConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    onApply(chartConfig);
  }, [chartConfig, onApply]);

  const chartTypeOptions = [{ label: 'Line Chart', value: 'line' }, { label: 'Bar Chart', value: 'bar' }];
  const allColumnsSelected = chartConfig.yAxisColumns.length === dataColumns.length;
  const handleToggleSelectAll = () => setChartConfig(prev => ({ ...prev, yAxisColumns: allColumnsSelected ? [] : dataColumns }));
  const handleColumnToggle = (column) => {
    setChartConfig(prev => {
      const newSelection = prev.yAxisColumns.includes(column) ? prev.yAxisColumns.filter((c) => c !== column) : [...prev.yAxisColumns, column];
      return { ...prev, yAxisColumns: newSelection };
    });
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <Fieldset legend="meter parameters">
        <Button type="button" onClick={handleToggleSelectAll} toggled={allColumnsSelected}>Select All Parameters</Button>
        {dataColumns.map((column) => (
          <Button key={column} type="button" onClick={() => handleColumnToggle(column)} toggled={chartConfig.yAxisColumns.includes(column)}>
            {column.toUpperCase()}
          </Button>
        ))}
      </Fieldset>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <Fieldset legend="chart options">
          <div className="flex flex-col gap-2 pt-3">
            <RadioGroup name="chartType" label="" options={chartTypeOptions} value={chartConfig.chartType} onChange={(value) => handleChange('chartType', value)} />
          </div>
        </Fieldset>
        <Fieldset legend="visual options">
          <div className="flex flex-row gap-2 pt-3">
            <Button type="button" onClick={() => handleChange('showPoints', !chartConfig.showPoints)} toggled={chartConfig.showPoints}>
              {chartConfig.showPoints ? 'Hide Points' : 'Show Points'}
            </Button>
            <Button type="button" onClick={() => handleChange('showLegend', !chartConfig.showLegend)} toggled={chartConfig.showLegend}>
              {chartConfig.showLegend ? 'Hide Legend' : 'Show Legend'}
            </Button>
          </div>
        </Fieldset>
      </div>
    </div>
  );
};

/** ------------------------------
 * Main Logs Chart View Component
 * ------------------------------ */
export default function LogsChartView({ combinedLogs, onFilterChange }) {
  const api = useFastApi();
  // **Updated chartConfig initial state to include zygsz**
  const [chartConfig, setChartConfig] = useState({
    yAxisColumns: ['ua', 'ub', 'zygsz'],
    chartType: 'line',
    showPoints: true,
    showLegend: true,
    theme: 'light',
    initialLoading: false,
  });

  const [filterValues, setFilterValues] = useState({
    meterId: null,
    startTime: '',
    endTime: '',
    limit: 100,
  });

  const [allMeters, setAllMeters] = useState([]);

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const meters = await api.listMeters();
        setAllMeters(meters);
      } catch (err) {
        console.error("Failed to fetch meters for filter:", err);
      }
    };
    fetchMeters();
  }, [api]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilterValues(newFilters);
    onFilterChange(newFilters);
  }, [onFilterChange]);

  const handleOptionsApply = useCallback((values) => {
    setChartConfig(prev => ({ ...prev, ...values }));
  }, []);

  // **Updated dataColumns to include 'zygsz'**
  const dataColumns = useMemo(() => {
    const columns = [
      'ua', 'ub', 'uc', 'ia', 'ib', 'ic', 'uab', 'ubc', 'uca', 'pa', 'pb', 'pc',
      'pfa', 'pfb', 'pfc', 'zglys', 'f', 'u', 'i', 'zyggl', 'zygsz',
    ];
    return columns;
  }, []);

  const filterableColumns = useMemo(() => {
    const meterOptions = allMeters.map(m => ({ label: m.serial, value: String(m.id) }));
    const limitOptions = [
      { label: '50 Points', value: 50 },
      { label: '100 Points', value: 100 },
      { label: '500 Points', value: 500 },
      { label: '1000 Points', value: 1000 },
    ];

    return [
      {
        key: 'meterId',
        header: 'Meter ID',
        field: SelectField,
        fieldProps: { options: meterOptions, searchable: true, value: filterValues.meterId, placeholder: "Select Meter" },
      },
      {
        key: 'limit',
        header: '# of Points',
        field: SelectField,
        fieldProps: { options: limitOptions, value: filterValues.limit, placeholder: "# of Points" },
      },
      {
        key: 'startTime',
        header: 'Start Time',
        field: InputField,
        fieldProps: { type: 'datetime-local', value: filterValues.startTime, placeholder: "Start Time" },
      },
      {
        key: 'endTime',
        header: 'End Time',
        field: InputField,
        fieldProps: { type: 'datetime-local', value: filterValues.endTime, placeholder: "End Time" },
      },
    ];
  }, [allMeters, filterValues]);

  const chartData = useMemo(() => {
    const datasets = chartConfig.yAxisColumns.map((col, index) => {
      const data = combinedLogs.map(d => {
        const value = d[col];
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
      });

      // **Updated colors to include a new one for zygsz**
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#CD5C5C', '#32CD32', '#00CED1', '#FFA500'];
      const color = colors[index % colors.length];

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
    
    // Add debug log
    console.debug('[LogsChartView] chartData', {
      labelsCount: combinedLogs.length,
      firstRow: combinedLogs[0],
      datasetsPreview: chartConfig.yAxisColumns.map(col => ({
        col,
        sampleData: combinedLogs.map(d => d[col]).slice(0, 6),
      })),
    });

    return {
      labels: combinedLogs.map(d => new Date(d.meter_time).toLocaleString()),
      datasets: datasets,
    };
  }, [combinedLogs, chartConfig, filterValues]);

  return (
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
        filterMenuProps={{ live: false }}
        initialLoading={chartConfig.initialLoading}
        fallbackMessage="No data found for the selected filters."
      />
    </div>
  );
}