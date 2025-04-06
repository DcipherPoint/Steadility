import React, { useState, useEffect } from 'react';
import { optimizeInventory } from '../../services/aiFeaturesService';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, BarChart, Calendar, Package, Users } from 'react-feather';
import { FaBrain } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Create a custom TrendingFlat component since it's not available in react-feather
const TrendingFlat = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <polyline points="15 5 22 12 15 19"></polyline>
  </svg>
);

const InventoryOptimization = () => {
  const [forecastDays, setForecastDays] = useState(7);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [lastOptimizedDate, setLastOptimizedDate] = useState(null);
  const { darkMode } = useTheme();

  // Use localStorage to store optimization results between sessions
  useEffect(() => {
    // Try to retrieve cached data from localStorage
    const cachedData = localStorage.getItem('inventoryOptimizationData');
    const cachedTimestamp = localStorage.getItem('inventoryOptimizationTimestamp');
    
    if (cachedData && cachedTimestamp) {
      try {
        const parsedData = JSON.parse(cachedData);
        const timestamp = new Date(cachedTimestamp);
        
        // Use cached data if it's from today (less than 24 hours old)
        if ((new Date() - timestamp) < 24 * 60 * 60 * 1000) {
          setOptimizationResult(parsedData);
          setLastOptimizedDate(timestamp);
        }
      } catch (error) {
        console.error("Error parsing cached inventory optimization data:", error);
        // If there's an error parsing, we'll just fetch fresh data
      }
    }
  }, []);

  const handleOptimize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate start and end dates for the API
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Use last 30 days of data
      
      const result = await optimizeInventory({
        forecast_horizon: forecastDays,
        force_db: true,
        start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      });
      
      setOptimizationResult(result);
      setLastOptimizedDate(new Date());
      
      // Cache the results in localStorage
      localStorage.setItem('inventoryOptimizationData', JSON.stringify(result));
      localStorage.setItem('inventoryOptimizationTimestamp', new Date().toISOString());
    } catch (err) {
      console.error("Optimization error:", err);
      // Handle string errors or object errors gracefully
      if (typeof err === 'string') {
        setError(err);
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during optimization");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (product) => {
    setSelectedProduct(product);
    setShowActionPopup(true);
  };

  const handleDetailClick = (dayData, forecast) => {
    // Prepare detail data including orders
    let details = {
      date: dayData.date,
      product: forecast.name,
      productId: forecast.product_id,
      location: forecast.location,
      quantity: dayData.quantity,
      // Find orders from historical data if available
      orders: [],
      // Add metadata if available
      metadata: null
    };
    
    // Look for this date in historical data to find orders and metadata
    if (forecast.historical_data) {
      const matchingDay = forecast.historical_data.find(d => d.date === dayData.date);
      if (matchingDay) {
        if (matchingDay.orders) {
          details.orders = matchingDay.orders;
        }
        if (matchingDay.metadata) {
          details.metadata = matchingDay.metadata;
        }
      }
    }
    
    setDetailData(details);
    setShowDetailPopup(true);
  };

  const handleNotifyMe = () => {
    // Implement notification logic here
    alert('Notification preferences saved!');
    setShowActionPopup(false);
  };

  const getChartOptions = (title, forecast) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: darkMode ? '#e5e7eb' : '#374151',
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#374151',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          // Add a callback to display "Click for details" in tooltip
          afterLabel: function(context) {
            return 'Click for details';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151'
        }
      },
      y: {
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151'
        },
        beginAtZero: true
      }
    },
    onClick: (event, elements) => {
      if (!elements || elements.length === 0) return;
      
      const { datasetIndex, index } = elements[0];
      // Determine which dataset (historical or forecast) was clicked
      const isHistorical = datasetIndex === 0;
      const clickedData = isHistorical 
        ? forecast.historical_data[index] 
        : forecast.forecast[index - forecast.historical_data.length];
      
      if (clickedData) {
        handleDetailClick(clickedData, forecast);
      }
    }
  });

  const renderChart = (forecast) => {
    // Combine historical and forecast data for a continuous chart
    const allDates = [...forecast.historical_data.map(point => point.date), ...forecast.forecast.map(point => point.date)];
    
    const data = {
      labels: allDates,
      datasets: [
        {
          label: 'Historical Data',
          data: forecast.historical_data.map(point => point.quantity),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#3b82f6',
          tension: 0.3,
          fill: false,
        },
        {
          label: 'Forecast',
          data: [...Array(forecast.historical_data.length).fill(null), ...forecast.forecast.map(point => point.quantity)],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981',
          tension: 0.3,
          fill: false,
        }
      ]
    };

    // Changed chart title to "Regular Sales"
    const chartOptions = getChartOptions("Regular Sales", forecast);

    return (
      <div className="h-[400px] w-full">
        <Line options={chartOptions} data={data} />
      </div>
    );
  };

  const renderInputSection = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Inventory Optimization</h2>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-grow">
          <label htmlFor="forecastDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Forecast Horizon (Days)
          </label>
          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            className={`w-full p-2 rounded-md border focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 bg-white border-gray-300 text-gray-900`}
          >
            <option value="7" className="bg-white dark:bg-gray-900 dark:text-gray-200">7 Days</option>
            <option value="14" className="bg-white dark:bg-gray-900 dark:text-gray-200">14 Days</option>
            <option value="30" className="bg-white dark:bg-gray-900 dark:text-gray-200">30 Days</option>
            <option value="60" className="bg-white dark:bg-gray-900 dark:text-gray-200">60 Days</option>
            <option value="90" className="bg-white dark:bg-gray-900 dark:text-gray-200">90 Days</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          {lastOptimizedDate && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last optimized: {lastOptimizedDate.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Optimizing...' : 'Optimize Inventory'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );

  const renderFiveDayForecast = (forecast) => {
    const next5Days = forecast.forecast.slice(0, 5);
    
    return (
      <div className="mt-24 grid grid-cols-5 gap-4">
        {next5Days.map((day, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => handleDetailClick(day, forecast)}
          >
            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className={`text-lg font-semibold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.round(day.quantity)}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Predicted Demand
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderOrderDistribution = (orders) => {
    if (!orders || orders.length === 0) return null;
    
    // Group by customer
    const customerData = {};
    orders.forEach(order => {
      const customer = order.customer || 'Unknown';
      if (!customerData[customer]) {
        customerData[customer] = 0;
      }
      customerData[customer] += order.quantity;
    });
    
    // Convert to Chart.js format
    const labels = Object.keys(customerData);
    const data = Object.values(customerData);
    
    // Generate colors
    const colors = [
      'rgba(59, 130, 246, 0.8)',  // Blue
      'rgba(16, 185, 129, 0.8)',  // Green
      'rgba(245, 158, 11, 0.8)',  // Yellow
      'rgba(239, 68, 68, 0.8)',   // Red
      'rgba(139, 92, 246, 0.8)',  // Purple
      'rgba(236, 72, 153, 0.8)',  // Pink
    ];
    
    // If more customers than colors, repeat colors
    const backgroundColors = labels.map((_, i) => colors[i % colors.length]);
    
    const chartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        }
      ]
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
    
    return (
      <div className="mt-6">
        <h4 className={`font-medium mb-3 text-center`}>Order Distribution by Customer</h4>
        <div className="h-64">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    );
  };

  const renderDetailPopup = () => {
    if (!showDetailPopup || !detailData) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailPopup(false)}></div>
        <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[80vh] overflow-auto`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-3">
                <Package className={darkMode ? "text-gray-300" : "text-gray-700"} size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {detailData.product}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(detailData.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDetailPopup(false)}
              className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <svg className={`w-6 h-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6`}>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Product Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product ID:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{detailData.productId}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Location:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{detailData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quantity:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{detailData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(detailData.date).toLocaleDateString()}
                  </span>
                </div>
                {/* Add metadata if available */}
                {detailData.metadata && (
                  <>
                    <div className="pt-2 mt-2 border-t border-gray-600">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Additional Data:
                      </span>
                    </div>
                    {Object.entries(detailData.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:
                        </span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-3">
                <Users size={16} className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Summary</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{detailData.orders?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Ordered:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {detailData.orders?.reduce((total, order) => total + order.quantity, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Order Size:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {detailData.orders?.length ? 
                      (detailData.orders.reduce((total, order) => total + order.quantity, 0) / detailData.orders.length).toFixed(2) : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customers:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {detailData.orders?.length ? 
                      new Set(detailData.orders.map(order => order.customer)).size : 
                      0}
                  </span>
                </div>
                {detailData.orders?.length > 0 && (
                  <div className="flex justify-between pt-2 mt-2 border-t border-gray-600">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Top Customer:</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(() => {
                        // Calculate top customer
                        const customerTotals = {};
                        detailData.orders.forEach(order => {
                          const customer = order.customer || 'Unknown';
                          customerTotals[customer] = (customerTotals[customer] || 0) + order.quantity;
                        });
                        const topCustomer = Object.entries(customerTotals)
                          .sort((a, b) => b[1] - a[1])[0];
                        return topCustomer ? `${topCustomer[0]} (${topCustomer[1]})` : 'N/A';
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order distribution chart would go here */}
          {detailData.orders?.length > 0 && renderOrderDistribution(detailData.orders)}

          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4 mt-4`}>
            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Breakdown</h4>
            
            {detailData.orders && detailData.orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}>Order ID</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}>Customer</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}>Quantity</th>
                      <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {detailData.orders.map((order, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-700' : 'bg-gray-50')}`}>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {order.order_id || `Order #${index + 1}`}
                        </td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {order.customer || 'Unknown'}
                        </td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {order.quantity}
                        </td>
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'completed' ? 
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {detailData.date.includes(new Date().getFullYear()) ? 
                  "No order details available for this date." : 
                  "This is a forecast date. Order details will be available when orders are placed."}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowDetailPopup(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActionPopup = () => {
    if (!showActionPopup || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActionPopup(false)}></div>
        <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-xl font-semibold mb-2 text-gray-900 dark:text-white`}>
            Actions for {selectedProduct.name}
          </h3>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose an action to take based on the forecast
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleNotifyMe}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Send Notification
            </button>
            <button
              disabled
              className="w-full py-2 px-4 rounded-lg bg-gray-400 text-gray-200 cursor-not-allowed"
            >
              Deploy Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendIcon = (direction, size = 20) => {
    switch(direction) {
      case 'increasing':
        return <TrendingUp size={size} className="text-green-500" />;
      case 'decreasing':
        return <TrendingDown size={size} className="text-red-500" />;
      default:
        return <TrendingFlat size={size} className="text-blue-500" />;
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(2);
  };

  const renderResults = () => {
    if (!optimizationResult || !optimizationResult.forecasts || optimizationResult.forecasts.length === 0) {
      // Display placeholder or initial message if no results yet
    return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Package size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-lg">Enter the forecast horizon and click 'Optimize Inventory' to see results.</p>
          {lastOptimizedDate && (
            <p className="text-sm mt-2">Last optimized: {lastOptimizedDate.toLocaleString()}</p>
          )}
        </div>
      );
          }
          
          return (
      <div className="space-y-8">
        {optimizationResult.forecasts.map((forecast, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                  <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Regular Sales</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{forecast.location || 'All Locations'}</p>
                  </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ 
                  forecast.summary.percent_change >= 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                    {renderTrendIcon(forecast.trend.direction, 16)}
                  <span className="ml-1">{formatNumber(forecast.summary.percent_change)}%</span>
                    </span>
                  <button
                    onClick={() => handleActionClick(forecast)}
                  className="ml-2 mt-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition duration-150 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Actions
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Historical Data</h4>
                  <BarChart size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{formatNumber(forecast.summary.avg_historical)}</p>
                    </div>
                <div className="text-center mt-2">
                   <p className="text-xs text-gray-500 dark:text-gray-400">Volatility</p>
                   <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{formatNumber(forecast.summary.historical_volatility) || 'N/A'}</p>
                    </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 px-2">
                  <span>Min: {formatNumber(forecast.summary.historical_min)}</span>
                  <span>Max: {formatNumber(forecast.summary.historical_max)}</span>
                  </div>
                </div>
                
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">Forecast Data</h4>
                  <Calendar size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                 <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{formatNumber(forecast.summary.avg_forecast)}</p>
                    </div>
                 <div className="text-center mt-2">
                   <p className="text-xs text-gray-500 dark:text-gray-400">Trend</p>
                   <p className={`text-lg font-medium ${forecast.trend.direction === 'increasing' ? 'text-green-600 dark:text-green-400' : forecast.trend.direction === 'decreasing' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {forecast.trend.direction.charAt(0).toUpperCase() + forecast.trend.direction.slice(1)}
                     <span className="text-xs"> ({forecast.trend.strength})</span>
                      </p>
                    </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3 px-2">
                  <span>Min: {formatNumber(forecast.summary.forecast_min)}</span>
                  <span>Max: {formatNumber(forecast.summary.forecast_max)}</span>
                  </div>
                </div>
                
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
                    <FaBrain size={16} className="mr-2 text-blue-500 dark:text-blue-400" />
                    AI Recommendation (Gemini)
                  </h4>
                  </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">{forecast.recommendation || 'Analysis complete. Maintain current strategy or review details.'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Confidence: {forecast.confidence || 'Medium'}</p>
                </div>
              </div>

            {/* Chart Section - Increased bottom margin */}
            <div className="mb-8 h-64 md:h-80"> 
              {renderChart(forecast)}
            </div>

                {renderFiveDayForecast(forecast)}
              </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {renderInputSection()}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600 dark:text-gray-400">Optimizing inventory levels...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      {!loading && renderResults()}
      {showActionPopup && renderActionPopup()}
      {showDetailPopup && renderDetailPopup()}
    </div>
  );
};

export default InventoryOptimization; 