import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  useId,
} from 'react';
import Chart from '../components/charts/Chart';
import DataTable from '../components/table/DataTable';
import clsx from 'clsx';
import { useFastApi } from '../hooks/fastapihooks/fastapihooks';
import SelectField from '../components/fields/SelectField';
import Button from '../components/ui/Button';
import FilterMenu from '../components/table/FilterMenu';
import DateField from '../components/fields/DateField';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';

/** ------------------------------
 * Export button component
 * ------------------------------ */
const ExportButton = ({ onClick }) => (
  <Button onClick={onClick} variant="icon" leftIcon={FaFilePdf}>
    Export PDF
  </Button>
);

/** ------------------------------
 * Utility function to handle raw log data
 * ------------------------------ */
const aggregateLogs = (logs) => {
  if (!logs || !Array.isArray(logs)) return [];

  const processedLogs = logs.map(item => ({
    // Merge properties from topic1 and topic2, prioritizing topic2's 'zygsz'
    ua: item.topic1?.ua,
    ub: item.topic1?.ub,
    uc: item.topic1?.uc,
    ia: item.topic1?.ia,
    ib: item.topic1?.ib,
    ic: item.topic1?.ic,
    uab: item.topic1?.uab,
    ubc: item.topic1?.ubc,
    uca: item.topic1?.uca,
    pa: item.topic1?.pa,
    pb: item.topic1?.pb,
    pc: item.topic1?.pc,
    pfa: item.topic1?.pfa,
    pfb: item.topic1?.pfb,
    pfc: item.topic1?.pfc,
    zglys: item.topic1?.zglys,
    f: item.topic1?.f,
    u: item.topic1?.u,
    i: item.topic1?.i,
    zyggl: item.topic1?.zyggl,
    zygsz: item.topic2?.zygsz ?? item.topic1?.zygsz,
    meter_id: item.topic1?.meter_id ?? item.topic2?.meter_id,
    meter_time: item.topic1?.meter_time ?? item.topic2?.meter_time ?? new Date().toISOString(),
  }));

  // Sort by meter_time in descending order
  return processedLogs.sort((a, b) => new Date(b.meter_time) - new Date(a.meter_time));
};

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

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
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
 * Main PowerUsageLogDashboard Component
 * ------------------------------ */
export default function PowerUsageLogDashboard() {
  const api = useFastApi();
  const [logsByMeterType, setLogsByMeterType] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  // State for selected IDs and date/time range
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedMeterId, setSelectedMeterId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // All available options for the dropdowns
  const [meters, setMeters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMappings, setCustomerMappings] = useState([]);

  // Ref for the table container
  const tableWrapperRef = useRef(null);
  // Using a Map for dynamic refs for each chart
  const chartRefs = useRef(new Map());

  const [chartConfig, setChartConfig] = useState({
    yAxisColumns: ['zyggl'],
    chartType: 'line',
    showPoints: false,
    showLegend: true,
    theme: 'light',
  });

  // Fetch initial data for dropdowns
  const fetchInitialData = useCallback(async () => {
    try {
      const [allMeters, allCustomers, allCustomerMappings] = await Promise.all([
        api.listMeters(),
        api.listCustomers(),
        api.listCustomerMappings(),
      ]);

      setMeters(allMeters);
      setCustomers(allCustomers);
      setCustomerMappings(allCustomerMappings);

      const firstCustomer = allCustomers?.[0];
      if (firstCustomer) {
        setSelectedCustomerId(firstCustomer.id);
      } else {
        setInitialLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      setInitialLoading(false);
    }
  }, [api]);

  // Fetch meter readings based on selected customer and meter
  const fetchMeterReadings = useCallback(async () => {
    setInitialLoading(true);
    const meterLogs = {};

    // Determine which meters to fetch data for
    let metersToFetch = [];
    if (selectedMeterId && selectedMeterId !== 'all') {
      const meter = meters.find(m => m.id === selectedMeterId);
      if (meter) metersToFetch.push(meter);
    } else if (selectedCustomerId) {
      const mappedMeters = customerMappings
        .filter(m => m.customer_id === selectedCustomerId)
        .map(m => meters.find(meter => meter.id === m.meter_id));
      metersToFetch = mappedMeters.filter(Boolean); // Filter out any undefined
    }

    if (metersToFetch.length === 0) {
      setLogsByMeterType({});
      setInitialLoading(false);
      return;
    }

    const fetchPromises = metersToFetch.map(async (meter) => {
      const type = meter.primary_secondary === 1 ? 'Primary' : 'Secondary';

      try {
        const data = await api.listCombinedLogsByMeter(
          meter.id,
          50,
          {
            start_time: startDate,
            end_time: endDate
          }
        );
        const readings = aggregateLogs(data?.readings || []);
        meterLogs[type] = readings;
      } catch (error) {
        console.error(`Failed to fetch readings for meter ${meter.id}:`, error);
        meterLogs[type] = [];
      }
    });

    await Promise.all(fetchPromises);
    setLogsByMeterType(meterLogs);
    setInitialLoading(false);
  }, [api, selectedCustomerId, selectedMeterId, meters, customerMappings, startDate, endDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMeterReadings();
    }
  }, [selectedCustomerId, selectedMeterId, fetchMeterReadings]);

  // Handlers
  const handleOptionsApply = useCallback((values) => {
    setChartConfig((prev) => ({ ...prev, ...values }));
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setSelectedCustomerId(newFilters.customerId);
    setSelectedMeterId(newFilters.meterId);
    setStartDate(newFilters.startDate);
    setEndDate(newFilters.endDate);
    // This clears the data and triggers a reload
    setLogsByMeterType({});
  }, []);

  /** ------------------------------------------------------------------
   * PDF Export Handler - Now correctly handles multiple dynamic charts
   * ------------------------------------------------------------------ */
  const handleExportPdf = async () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      let y = 40; // Initial Y position with some margin
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;

      // Add report header
      doc.setFontSize(22);
      doc.text("Power Usage Log Report", pageWidth / 2, y, { align: 'center' });
      y += 20;
      doc.setFontSize(10);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
      y += 30;

      // Loop through each dynamic chart
      const meterTypes = Object.keys(logsByMeterType);
      for (const type of meterTypes) {
        const chartContainer = chartRefs.current.get(type);

        if (chartContainer) {
          const chartCanvas = chartContainer.querySelector('canvas');
          if (chartCanvas) {
            const chartDataUrl = chartCanvas.toDataURL('image/png', 1.0);
            const imgProps = doc.getImageProperties(chartDataUrl);
            const imgWidth = pageWidth - (2 * margin);
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            // Add chart title
            doc.setFontSize(14);
            doc.text(`${type} Meter Readings`, margin, y);
            y += 20;

            // Add chart image
            doc.addImage(chartDataUrl, 'PNG', margin, y, imgWidth, imgHeight);
            y += imgHeight + 30;

            // Check if a new page is needed for the next chart/table
            if (y + 100 > doc.internal.pageSize.getHeight()) {
              doc.addPage();
              y = 40;
            }
          }
        }
      }

      // Add a new page for the table if charts are present
      if (meterTypes.length > 0) {
          doc.addPage();
          y = 40;
      }
      
      // Add table using jspdf-autotable
      if (summaryTableData.rows.length > 0) {
        doc.setFontSize(22);
        doc.text("Meter Data Table", pageWidth / 2, y, { align: 'center' });
        y += 30;
        
        // Prepare table data for jspdf-autotable
        const tableHeaders = tableColumns.map(col => col.header);
        const tableBody = summaryTableData.rows.map(row => tableColumns.map(col => {
          let value = row[col.key];
          if (col.render) {
            value = col.render(value);
          }
          return value;
        }));

        autoTable(doc, {
          startY: y,
          head: [tableHeaders],
          body: tableBody,
          foot: [[
            { content: 'Total Additional Power Consumption', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: summaryTableData.totals.totalAdditionalPower.toFixed(2), styles: { halign: 'right', fontStyle: 'bold' } }
          ]],
          theme: 'grid',
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 10,
            cellPadding: 4,
            halign: 'center',
          },
          headStyles: {
            fillColor: [22, 78, 99], // Tailwind's 'teal-800'
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
          },
          didDrawPage: (data) => {
              // Add a page number on each page
              doc.setFontSize(8);
              const pageCount = doc.internal.getNumberOfPages();
              doc.text(`Page ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
          }
        });
      }

      doc.save("power-usage-dashboard.pdf");
    } catch (err) {
      console.error("Export PDF error:", err);
      alert('Failed to generate PDF. Please try again.');
    }
  };


  // Filterable columns for the FilterMenu
  const filterableColumns = useMemo(() => {
    const customerOptions = customers.map((cust) => ({
      label: cust.customer,
      value: cust.id,
    }));

    const relevantMeters = customerMappings
      .filter(m => m.customer_id === selectedCustomerId)
      .map(m => meters.find(meter => meter.id === m.meter_id))
      .filter(Boolean);

    const meterOptions = [
      { label: 'All Meters', value: 'all' },
      ...relevantMeters.map((meter) => ({
        label: `${meter.serial} (${meter.primary_secondary === 1 ? 'Primary' : 'Secondary'})`,
        value: meter.id,
      })),
    ];

    return [
      {
        key: 'customerId',
        header: 'Customer',
        field: SelectField,
        fieldProps: {
          options: customerOptions,
          searchable: true,
          value: selectedCustomerId,
          allowClear: true,
        },
      },
      {
        key: 'meterId',
        header: 'Meter',
        field: SelectField,
        fieldProps: {
          options: meterOptions,
          searchable: true,
          value: selectedMeterId,
          disabled: !selectedCustomerId,
          allowClear: false,
        },
      },
      {
        key: 'startDate',
        header: 'Start Date',
        field: DateField,
        fieldProps: {
          value: startDate,
          onChange: (v) => handleFilterChange({ customerId: selectedCustomerId, meterId: selectedMeterId, startDate: v, endDate }),
        },
      },
      {
        key: 'endDate',
        header: 'End Date',
        field: DateField,
        fieldProps: {
          value: endDate,
          onChange: (v) => handleFilterChange({ customerId: selectedCustomerId, meterId: selectedMeterId, startDate, endDate: v }),
        },
      },
    ];
  }, [customers, meters, customerMappings, selectedCustomerId, selectedMeterId, startDate, endDate, handleFilterChange]);

  // Chart and Table data columns for display
  const dataColumns = useMemo(() => {
    return [
      'ua', 'ub', 'uc', 'ia', 'ib', 'ic', 'uab', 'ubc', 'uca',
      'pa', 'pb', 'pc', 'pfa', 'pfb', 'pfc', 'zglys', 'f', 'u', 'i', 'zyggl', 'zygsz'
    ];
  }, []);

  /* ------------------------------------------------------------------
   * This hook processes the raw logs into the summary table format.
   * Now it creates a row for EACH meter.
   * ------------------------------------------------------------------ */
  const summaryTableData = useMemo(() => {
    const data = [];

    // Find all unique meter IDs from the fetched logs
    const allFetchedMeterIds = new Set();
    Object.values(logsByMeterType).forEach(logArray => {
      logArray.forEach(log => allFetchedMeterIds.add(log.meter_id));
    });

    // Create a row for each meter ID found
    allFetchedMeterIds.forEach(meterId => {
      const primaryReading = logsByMeterType['Primary']?.find(log => log.meter_id === meterId) || null;
      const secondaryReading = logsByMeterType['Secondary']?.find(log => log.meter_id === meterId) || null;

      const primarySource = primaryReading?.zyggl ?? 0;
      const secondarySource = secondaryReading?.zyggl ?? 0;
      const entailedPower = 0.5; // Fixed value as per the image

      // Calculations
      const totalConsumption = primarySource + secondarySource;
      const additionalPower = Math.max(0, totalConsumption - entailedPower);

      const meterName = meters.find(m => m.id === meterId)?.serial || meterId;

      data.push({
        rackName: meterName,
        primarySource: primarySource,
        secondarySource: secondarySource,
        totalConsumption: totalConsumption,
        entailedPower: entailedPower,
        additionalPower: additionalPower,
      });
    });

    // This section calculates the total for the entire table.
    const totalAdditionalPower = data.reduce((sum, row) => sum + row.additionalPower, 0);

    return {
      rows: data,
      totals: {
        totalAdditionalPower: totalAdditionalPower,
      },
    };
  }, [logsByMeterType, meters]);

  const tableColumns = useMemo(() => {
    return [
      { key: 'rackName', header: 'Rack Name', sortable: false },
      {
        key: 'primarySource',
        header: 'Primary Source (kW)',
        align: 'right',
        render: (val) => val.toFixed(2),
        sortable: false
      },
      {
        key: 'secondarySource',
        header: 'Secondary Source (kW)',
        align: 'right',
        render: (val) => val.toFixed(2),
        sortable: false
      },
      {
        key: 'totalConsumption',
        header: 'Total Consumption (kW)',
        align: 'right',
        render: (val) => val.toFixed(2),
        sortable: false
      },
      {
        key: 'entailedPower',
        header: 'Threshold (kW)',
        align: 'right',
        render: (val) => val.toFixed(2),
        sortable: false
      },
      {
        key: 'additionalPower',
        header: 'Extra Consumption (kW)',
        align: 'right',
        render: (val) => val.toFixed(2),
        sortable: false
      },
    ];
  }, []);

  const totalRow = useMemo(() => {
    if (summaryTableData.rows.length === 0) return null;
    return (
      <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
        <td colSpan="5" className="px-4 py-2 text-right">
          Total Additional Power Consumption
        </td>
        <td className="px-4 py-2 text-right">
          {summaryTableData.totals.totalAdditionalPower.toFixed(2)}
        </td>
      </tr>
    );
  }, [summaryTableData]);

  /* ------------------------------------------------------------------
   * Dynamic rendering (charts stay split, table is unified)
   * ------------------------------------------------------------------ */
  const renderDashboardSections = useMemo(() => {
    if (initialLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      );
    }

    const meterTypes = Object.keys(logsByMeterType);
    if (meterTypes.length === 0) {
      return (
        <div className="py-20 text-center text-gray-500">
          <p className="text-xl font-semibold mb-2">No meter data available.</p>
          <p>Please select a customer with assigned meters to view data.</p>
        </div>
      );
    }

    /* ------------- charts (still one per primary/secondary) ---------- */
    const chartSections = meterTypes.map(type => {
      const logs = logsByMeterType[type];

      const chartData = {
        labels: logs.map(d => new Date(d.meter_time).toLocaleTimeString()),
        datasets: chartConfig.yAxisColumns.map((col, idx) => {
          const hue = (360 / chartConfig.yAxisColumns.length) * idx;
          const color = `hsl(${hue}, 70%, 50%)`;
          return {
            label: col.toUpperCase(),
            data: logs.map(d => Number(d[col])).reverse(),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: chartConfig.showPoints ? 3 : 0,
            pointHoverRadius: chartConfig.showPoints ? 5 : 0,
          };
        }),
      };
      
      const setRef = (el) => {
        if (el) {
          chartRefs.current.set(type, el);
        } else {
          chartRefs.current.delete(type);
        }
      };

      return (
        <div key={type} ref={setRef} className="my-8">
          <h2 className="text-2xl font-semibold capitalize mb-4">
            {type} Meter Readings
          </h2>
          <div className="bg-white rounded-lg py-12 shadow-md h-[500px] mb-8">
            <Chart
              type={chartConfig.chartType}
              data={chartData}
              options={{
                plugins: { legend: { display: chartConfig.showLegend, position: 'bottom' } },
              }}
              allowZoomAndPan
              theme={chartConfig.theme}
              initialLoading={initialLoading}
            />
          </div>
        </div>
      );
    });

    /* ----------------------- single unified table -------------------- */
    const tableSection = (
      <div className="mt-8 bg-white rounded-lg shadow-md p-4">
        <DataTable
          data={summaryTableData.rows}
          columns={tableColumns}
          searchable
          title="Meter Data Table"
          pageSizeOptions={[10, 25, 50]}
          customFooter={totalRow}
        />
      </div>
    );

    return (
      <>
        {chartSections}
        <div ref={tableWrapperRef}>{tableSection}</div>
      </>
    );
  }, [
    initialLoading,
    logsByMeterType,
    summaryTableData,
    chartConfig,
    dataColumns,
    tableColumns,
    totalRow,
  ]);

  /* ------------------------------------------------------------------ */
  /* ---------------------------- RENDER ------------------------------ */
  /* ------------------------------------------------------------------ */
  return (
    <div className="px-2 py-1">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Power Usage</h1>
          <p className="opacity-70">Visualize and analyze power usage data </p>
        </div>
        <div className="flex items-center space-x-2">
          <FilterMenu
            columns={filterableColumns}
            onFilterChange={handleFilterChange}
            live
          />
          <ExportButton onClick={handleExportPdf} />
        </div>
      </div>

      {renderDashboardSections}
    </div>
  );
}