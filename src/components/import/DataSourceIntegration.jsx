import React, { useState } from 'react';
import { connectDataSource } from '../../services/aiFeaturesService';
import { CloudArrowUpIcon, CircleStackIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const DataSourceIntegration = () => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [file, setFile] = useState(null);

  const dataSources = [
    {
      id: 'odoo',
      name: 'Odoo ERP',
      description: 'Connect directly to your Odoo ERP system',
      icon: CircleStackIcon,
      comingSoon: true
    },
    {
      id: 'zoho',
      name: 'Zoho Inventory',
      description: 'Import data from Zoho Inventory',
      icon: TableCellsIcon,
      comingSoon: true
    },
    {
      id: 'csv',
      name: 'CSV Upload',
      description: 'Upload your data using CSV files',
      icon: CloudArrowUpIcon,
      fields: [
        { name: 'file', label: 'CSV File', type: 'file', accept: '.csv' }
      ]
    }
  ];

  const handleSourceSelect = (source) => {
    if (source.comingSoon) return;
    setSelectedSource(source);
    setCredentials({});
    setError(null);
    setSuccess(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFile(files[0]);
      setCredentials({ file: files[0] });
    } else {
      setCredentials(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connectDataSource('csv', credentials);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Data Source Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dataSources.map((source) => (
          <button
            key={source.id}
            onClick={() => handleSourceSelect(source)}
            disabled={source.comingSoon}
            className={`relative group p-6 text-left transition-all duration-200 rounded-2xl border 
              ${source.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1'}
              ${selectedSource?.id === source.id 
                ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-dark/50 hover:border-primary/50'}`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <source.icon className={`w-8 h-8 ${
                  selectedSource?.id === source.id 
                    ? 'text-primary' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-primary'
                }`} />
                {source.comingSoon && (
                  <span className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {source.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {source.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Upload Form */}
      {selectedSource && (
        <div className="bg-white dark:bg-neutral-dark/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload Your Data
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a CSV file containing your inventory data
            </p>
          </div>
          
          <div className="p-6">
            <div className="max-w-xl">
              <div className="space-y-6">
                {selectedSource.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => document.querySelector(`input[name="${field.name}"]`).click()}
                          className="px-6 py-2.5 bg-primary text-white rounded-full hover:bg-primary-light 
                            transition-colors duration-200 font-medium text-sm inline-flex items-center"
                        >
                          Choose File
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {file ? file.name : 'No file chosen'}
                        </span>
                      </div>
                      <input
                        type={field.type}
                        name={field.name}
                        accept={field.accept}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-4 mt-8">
                  <button
                    onClick={handleConnect}
                    disabled={loading || !file}
                    className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary-light 
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md
                      transform hover:-translate-y-0.5"
                  >
                    {loading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  File uploaded successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceIntegration; 