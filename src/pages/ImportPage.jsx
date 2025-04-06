import React from 'react';
import DataSourceIntegration from '../components/import/DataSourceIntegration';

const ImportPage = () => {
  return (
    <div className="h-full bg-gray-50 dark:bg-neutral-dark">
      {/* Header Section */}
      <div className="px-8 py-6 border-b dark:border-gray-800 bg-white dark:bg-neutral-dark/50 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Import Data
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Connect your data sources or upload files to start optimizing your logistics operations
        </p>
      </div>

      {/* Content Section */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <DataSourceIntegration />
        </div>
      </div>
    </div>
  );
};

export default ImportPage; 