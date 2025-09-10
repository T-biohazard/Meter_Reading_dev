// src/components/Dashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Chart from '../components/charts/Chart';
import DataTable from '../components/table/DataTable';
import { BarChart2, List } from 'lucide-react';

const generateData = (count) => {
  const data = [];
  const categories = ['Electronics', 'Home Goods', 'Apparel', 'Books'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  for (let i = 0; i < count; i++) {
    data.push({
      product: `Product ${i + 1}`,
      sales: Math.floor(Math.random() * 1000) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      month: months[Math.floor(Math.random() * months.length)],
      price: (Math.random() * 500).toFixed(2),
    });
  }
  return data;
};

// Our mock data
const allSalesData = generateData(500);

// New: StatCard Component
const StatCard = ({ title, value, unit, truncate = false }) => (
  <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200">
    <h2 className="text-sm font-semibold text-gray-500 mb-1">{title}</h2>
    <p className={`text-lg font-bold text-gray-800 ${truncate ? 'truncate' : ''}`} title={truncate ? value : undefined}>
      {value} {unit}
    </p>
  </div>
);

// New: Skeleton loaders for a better user experience during loading
const CardSkeleton = () => <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>;
const ChartSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;
const TableSkeleton = () => <div className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>;


export default function Dashboard() {
  const [tableData, setTableData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a data fetch with a 1-second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTableData(allSalesData);
      setIsLoading(false);
    }, 1000); // 1-second delay
    return () => clearTimeout(timer);
  }, []);

  // --- Chart Data ---
  const monthlySalesChartData = useMemo(() => {
    const salesByMonth = allSalesData.reduce((acc, item) => {
      acc[item.month] = (acc[item.month] || 0) + item.sales;
      return acc;
    }, {});

    const monthsOrder = ['January', 'February', 'March', 'April', 'May', 'June'];
    const sortedSales = monthsOrder.map(month => salesByMonth[month] || 0);

    return {
      labels: monthsOrder,
      datasets: [
        {
          label: 'Total Sales by Month',
          data: sortedSales,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const salesByCategoryChartData = useMemo(() => {
    const salesByCategory = allSalesData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.sales;
      return acc;
    }, {});

    const categories = Object.keys(salesByCategory);
    const sales = Object.values(salesByCategory);

    return {
      labels: categories,
      datasets: [
        {
          label: 'Sales by Category',
          data: sales,
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(244, 63, 94, 0.6)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(244, 63, 94)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const teamSkillData = {
    labels: ['Communication', 'Problem-Solving', 'Technical Skill', 'Creativity', 'Teamwork'],
    datasets: [
      {
        label: 'Team Performance',
        data: [90, 85, 95, 75, 92],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const bugSeverityData = {
    labels: ['Critical', 'High', 'Medium', 'Low', 'Trivial'],
    datasets: [
      {
        label: 'Bug Severity Distribution',
        data: [10, 40, 60, 25, 5],
        backgroundColor: ['#e33333', '#ff9900', '#f4e300', '#00c000', '#36a3eb'],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  // --- Interaction Handlers ---
  const handleChartClick = (type) => ({ label }) => {
    let filteredRows;
    if (type === 'bar') {
      filteredRows = allSalesData.filter(row => row.month === label);
    } else if (type === 'pie') {
      filteredRows = allSalesData.filter(row => row.category === label);
    }
    setTableData(filteredRows);
    setActiveFilter(label);
  };

  const handleClearFilter = () => {
    setTableData(allSalesData);
    setActiveFilter(null);
  };

  const dashboardMetrics = useMemo(() => {
    const totalSales = tableData.reduce((sum, item) => sum + item.sales, 0);
    const totalProducts = tableData.length;
    const uniqueCategories = new Set(tableData.map(item => item.category)).size;
    const averagePrice = totalSales > 0 ? tableData.reduce((sum, item) => sum + parseFloat(item.price), 0) / totalProducts : 0;

    return {
      totalSales: totalSales.toLocaleString('en-US'),
      totalProducts: totalProducts,
      uniqueCategories: uniqueCategories,
      averagePrice: `$${averagePrice.toFixed(2)}`,
    };
  }, [tableData]);

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-extrabold mb-8 text-center md:text-left">
        Interactive Sales Dashboard 📊
      </h1>

      {/* Details Card Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Sales" value={dashboardMetrics.totalSales} unit="USD" />
          <StatCard title="Total Products" value={dashboardMetrics.totalProducts} />
          <StatCard title="Unique Categories" value={dashboardMetrics.uniqueCategories} />
          <StatCard title="Average Price" value={dashboardMetrics.averagePrice} />
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <ChartSkeleton /><ChartSkeleton /><ChartSkeleton /><ChartSkeleton />
          </>
        ) : (
          <>
            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Monthly Sales Chart">
              <h2 className="text-xl font-semibold mb-2">Monthly Sales</h2>
              <Chart
                type="bar"
                data={monthlySalesChartData}
                onClick={handleChartClick('bar')}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(context.raw);
                          return label;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Sales by Category Pie Chart">
              <h2 className="text-xl font-semibold mb-2">Sales by Category</h2>
              <Chart
                type="pie"
                data={salesByCategoryChartData}
                onClick={handleChartClick('pie')}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw;
                          return `${label}: ${value.toLocaleString('en-US')} sales`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Bug Severity Distribution Polar Area Chart">
              <h2 className="text-xl font-semibold mb-2">Bug Severity Distribution</h2>
              <Chart
                type="polarArea"
                data={bugSeverityData}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw;
                          return `${label}: ${value.toLocaleString()} bugs`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="relative h-[400px] bg-white rounded-xl shadow-md p-6 flex flex-col" aria-label="Team Skills Radar Chart">
              <h2 className="text-xl font-semibold mb-2">Team Skills Radar</h2>
              <Chart
                type="radar"
                data={teamSkillData}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.raw;
                          return `${label}: ${value}%`;
                        }
                      }
                    }
                  }
                }}
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
              <h2 className="text-xl font-semibold text-gray-700">Sales Transactions {activeFilter && `(Filtered by: ${activeFilter})`}</h2>
              {activeFilter && (
                <button onClick={handleClearFilter} className="text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200" aria-label="Clear all filters">
                  Clear Filter
                </button>
              )}
            </div>
            <DataTable
              title="Sales"
              data={tableData}
              columns={[
                { key: 'product', header: 'Product' },
                { key: 'category', header: 'Category' },
                { key: 'month', header: 'Month' },
                { key: 'sales', header: 'Sales', isSortable: true },
                { key: 'price', header: 'Price', isSortable: true, render: (val) => `$${val}` },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}