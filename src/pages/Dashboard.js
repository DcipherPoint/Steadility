import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AIFeaturesSection from '../components/ai-features/AIFeaturesSection';
import { SparklesIcon, ShieldCheckIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState({
    liveOrders: 45,
    pastOrders: 120,
    plannedOrders: 30
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleImportData = () => {
    navigate('/dashboard/import');
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/import')}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Integration</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Connect data sources</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/ai-features')}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ChartPieIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Features</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Access AI tools</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/dashboard/risk-radar')}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Monitoring</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Monitor supply chain risks</p>
            </div>
          </div>
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Supply Chain Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">AI-powered supply chain optimization and monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleImportData}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Import Data'}
          </button>
        </div>
      </div>

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">LIVE ORDERS</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-blue-600">{inventoryData.liveOrders}</div>
            <div className="text-sm text-gray-500">Current Processing</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">PAST ORDERS</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600">{inventoryData.pastOrders}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">PLANNED ORDERS</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-purple-600">{inventoryData.plannedOrders}</div>
            <div className="text-sm text-gray-500">Upcoming</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;