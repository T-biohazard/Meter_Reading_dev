import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Chart from '../charts/Chart';
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
export default function LogsChartView({
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
  const [chartConfig, setChartConfig] = useState({
    yAxisColumns: ['ua', 'ub', 'zygsz'],
    chartType: 'line',
    showPoints: true,
    showLegend: true,
    theme: 'light',
  });

  const handleOptionsApply = useCallback((values) => {
    setChartConfig(prev => ({ ...prev, ...values }));
  }, []);

  const dataColumns = useMemo(() => {
    const columns = [
      'ua', 'ub', 'uc', 'ia', 'ib', 'ic', 'uab', 'ubc', 'uca', 'pa', 'pb', 'pc',
      'pfa', 'pfb', 'pfc', 'zglys', 'f', 'u', 'i', 'zyggl', 'zygsz',
    ];
    return columns;
  }, []);

  const chartData = useMemo(() => {
    const datasets = chartConfig.yAxisColumns.map((col, index) => {
      const data = combinedLogs.map(d => {
        const value = d[col];
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? null : parsedValue;
      });

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
    
    return {
      labels: combinedLogs.map(d => new Date(d.meter_time).toLocaleString()),
      datasets: datasets,
    };
  }, [combinedLogs, chartConfig]);

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
        filterMenuComponent={FilterMenuContent}
        initialLoading={loading}
        fallbackMessage="No data found for the selected filters."
      />
    </div>
  );
}