import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { optimizeInventory, generateReroutingPlan } from '../../services/aiFeaturesService';

const tabs = [
  { name: 'Demand Forecasting', icon: '📊', description: 'AI-powered demand prediction based on historical data' },
  { name: 'Dynamic Docking', icon: '🔄', description: 'Smart retailer-to-retailer transfer suggestions' },
  { name: 'Inventory Monitoring', icon: '📈', description: 'Real-time inventory tracking and alerts' },
  { name: 'Dynamic Rerouting', icon: '🛣️', description: 'AI-assisted rerouting plans for disruptions' }
];

const AIFeaturesSection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleOptimizeInventory = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      const response = await optimizeInventory({ 
        feature: tab.name,
        forecast_horizon: 7 // Default to 7 days forecast
      });
      setResults(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReroutingPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generateReroutingPlan({
        affected_unit_type: 'warehouse',
        disruption_type: 'natural_disaster',
        affected_location: 'New York'
      });
      setResults(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-green-600 dark:hover:text-green-400'
                }`
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {tabs.map((tab) => (
            <Tab.Panel
              key={tab.name}
              className="rounded-xl bg-white dark:bg-gray-800 p-3"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {tab.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {tab.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (tab.name === 'Dynamic Rerouting') {
                        handleGenerateReroutingPlan();
                      } else {
                        handleOptimizeInventory(tab);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Run Analysis'}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                {results && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default AIFeaturesSection; 