import React from 'react';
import { 
  CubeIcon, 
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon  
} from '@heroicons/react/24/outline';
import { useInventory } from '../../../contexts/InventoryContext';

const Inventory = () => {
  const { 
    inventoryData, 
    lastUpdated, 
    loading, 
    error, 
    fetchInventoryData,
    connectionValid
  } = useInventory();

  const handleRefresh = () => {
    // Force a refresh by passing true
    fetchInventoryData(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Monitor and manage your inventory levels</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Connection Warning */}
      {!connectionValid && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-600 dark:text-yellow-400">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>No valid Odoo connection found. Please configure your integration in Settings first.</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CubeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '...' : inventoryData.totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '...' : inventoryData.lowStock}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '...' : inventoryData.outOfStock}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Points</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '...' : inventoryData.reorderPoints}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inventory by Category</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : inventoryData.categories.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No category data available</p>
          ) : (
            <div className="space-y-4">
              {inventoryData.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      category.status === 'healthy' ? 'bg-green-500' :
                      category.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{category.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Movements</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : inventoryData.recentMovements.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No recent movements available</p>
          ) : (
            <div className="space-y-4">
              {inventoryData.recentMovements.map((movement, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      movement.type === 'in' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-700 dark:text-gray-300">{movement.item}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-medium ${
                      movement.type === 'in' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </span>
                    <span className="text-sm text-gray-500">{movement.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory; 