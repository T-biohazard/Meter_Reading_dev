import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import clsx from 'clsx';
import Button from '../ui/Button';
import { SlidersHorizontal, X, Download } from 'lucide-react';
import { useOutside } from '../../hooks/useOutside';
import FilterMenu from '../table/FilterMenu';

ChartJS.register(...registerables, zoomPlugin, annotationPlugin);

const Chart = forwardRef(
  (
    {
      type,
      data,
      options,
      className,
      fallbackMessage = 'No data to display.',
      chartOptionsComponent,
      allowZoomAndPan = false,
      annotations = [],
      animationDuration = 1000,
      tooltipCallback,
      initialLoading = false,
      theme = 'light',
      onZoom,
      filterColumns,
      onFilterChange,
      // 👈 ADD THIS PROP
      filterMenuProps = {},
    },
    ref
  ) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const optionsDrawerRef = useRef(null);
    const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
    const [chartLoaded, setChartLoaded] = useState(false);
    useOutside(optionsDrawerRef, () => setIsOptionsDrawerOpen(false));

    const hasData = useMemo(() => {
      return (
        data &&
        data.datasets &&
        data.datasets.length > 0 &&
        data.datasets.some((dataset) => dataset.data && dataset.data.length > 0)
      );
    }, [data]);

    const themeColors = useMemo(() => {
      if (theme === 'dark') {
        return {
          background: '#1f2937',
          text: '#f9fafb',
          grid: '#4b5563',
          border: '#6b7280',
        };
      }
      return {
        background: '#ffffff',
        text: '#111827',
        grid: '#e5e7eb',
        border: '#d1d5db',
      };
    }, [theme]);

    const handleSaveChart = useCallback(() => {
      if (chartInstanceRef.current) {
        const chart = chartInstanceRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = chart.width;
        tempCanvas.height = chart.height;
        const ctx = tempCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(chart.canvas, 0, 0);
        const url = tempCanvas.toDataURL('image/png', 1);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, []);

    useEffect(() => {
      const cleanup = () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
      };

      if (!chartRef.current || !hasData) {
        cleanup();
        setChartLoaded(false);
        return;
      }

      const ctx = chartRef.current.getContext('2d');
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animationDuration,
          easing: 'easeOutQuart',
          onComplete: () => {
            setChartLoaded(true);
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: themeColors.text },
          },
          tooltip: {
            backgroundColor: themeColors.background,
            titleColor: themeColors.text,
            bodyColor: themeColors.text,
            borderColor: themeColors.border,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: tooltipCallback,
          },
          zoom: allowZoomAndPan
            ? {
                zoom: {
                  wheel: { enabled: true, speed: 0.1 },
                  drag: { enabled: true, backgroundColor: 'rgba(75,192,192,0.2)' },
                  mode: 'xy',
                },
                pan: { enabled: true, mode: 'xy' },
                limits: { y: { min: 0 } },
                onZoom: onZoom,
              }
            : undefined,
          annotation: { annotations: annotations },
        },
        scales: {
          x: {
            grid: { color: themeColors.grid },
            ticks: { color: themeColors.text },
            title: { color: themeColors.text },
          },
          y: {
            grid: { color: themeColors.grid },
            ticks: { color: themeColors.text },
            title: { color: themeColors.text },
          },
        },
        ...options,
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.data = data;
        chartInstanceRef.current.options = chartOptions;
        chartInstanceRef.current.update();
      } else {
        chartInstanceRef.current = new ChartJS(ctx, {
          type: type,
          data: data,
          options: chartOptions,
        });
      }
      return cleanup;
    }, [
      type,
      data,
      options,
      hasData,
      allowZoomAndPan,
      annotations,
      animationDuration,
      tooltipCallback,
      themeColors,
      onZoom,
    ]);

    useImperativeHandle(ref, () => ({
      getChartInstance: () => chartInstanceRef.current,
      saveAsImage: handleSaveChart,
    }));

    const showFallback = useMemo(() => !hasData && !initialLoading, [hasData, initialLoading]);

    return (
      <div className={clsx('relative w-full h-full', className)} style={{ backgroundColor: themeColors.background }}>
        <div className="flex justify-between p-2">
          <div className="flex items-center space-x-2"></div>
          <div className="flex space-x-2 z-10">
            <Button onClick={handleSaveChart} leftIcon={Download} variant="icon" title="Download Chart">
              Download
            </Button>
            {filterColumns && onFilterChange && (
              <FilterMenu
                columns={filterColumns}
                onFilterChange={onFilterChange}
                // 👈 SPREAD THE NEW PROPS HERE
                {...filterMenuProps}
              />
            )}
            {chartOptionsComponent && (
              <Button
                onClick={() => setIsOptionsDrawerOpen(true)}
                leftIcon={SlidersHorizontal}
                variant="icon"
                title="Chart Options"
              >
                Parameters
              </Button>
            )}
          </div>
        </div>
        {initialLoading && !hasData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        )}
        {showFallback ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <p className="text-lg font-semibold">{fallbackMessage}</p>
            <p className="text-sm mt-2">Check your data source or filters.</p>
          </div>
        ) : (
          <div className="relative h-full w-full p-2" style={{ visibility: chartLoaded ? 'visible' : 'hidden' }}>
            <canvas ref={chartRef} />
          </div>
        )}
        {isOptionsDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40"
            onClick={() => setIsOptionsDrawerOpen(false)}
          ></div>
        )}
        <div
          ref={optionsDrawerRef}
          className={clsx(
            'fixed bottom-0 left-0 right-0 h-[33%] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col rounded-t-lg',
            isOptionsDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          )}
          style={{ backgroundColor: themeColors.background, color: themeColors.text }}
        >
          <div
            className="flex-none flex items-center justify-between p-4 border-b"
            style={{ borderColor: themeColors.border }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Chart Options
            </h2>
            <Button onClick={() => setIsOptionsDrawerOpen(false)} variant="icon" size="sm" title="Close Options">
              <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">{chartOptionsComponent}</div>
        </div>
      </div>
    );
  }
);
Chart.displayName = 'Chart';
export default Chart;