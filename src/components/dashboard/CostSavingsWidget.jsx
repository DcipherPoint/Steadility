import React from 'react';

const CostSavingsWidget = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">COST SAVINGS ANALYSIS</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Cost Saved</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            ${data.fuelSavings.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            ↑ {data.fuelSavingsPercentage}% vs last month
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Carbon Credits</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
            ${data.carbonCredits.toLocaleString()}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {data.availableCredits} credits available
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Savings Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(data.breakdown).map(([category, percentage]) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">{category}</span>
                <span className="text-gray-900 dark:text-gray-100">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostSavingsWidget;
