import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    supplyChain: {
      units: [],
      inventoryTracking: {}
    },
    dataSource: {
      type: null,
      credentials: {},
      mapping: {}
    },
    sync: {
      status: 'pending',
      progress: 0,
      errors: []
    }
  });

  const handleSupplyChainSelection = (unit, tracking) => {
    setConfig(prev => ({
      ...prev,
      supplyChain: {
        ...prev.supplyChain,
        units: prev.supplyChain.units.includes(unit)
          ? prev.supplyChain.units.filter(u => u !== unit)
          : [...prev.supplyChain.units, unit],
        inventoryTracking: {
          ...prev.supplyChain.inventoryTracking,
          [unit]: tracking
        }
      }
    }));
  };

  const handleDataSourceSelection = (type) => {
    setConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        type
      }
    }));
  };

  const handleCredentialUpdate = (credentials) => {
    setConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        credentials
      }
    }));
  };

  const handleMappingUpdate = (mapping) => {
    setConfig(prev => ({
      ...prev,
      dataSource: {
        ...prev.dataSource,
        mapping
      }
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!config.supplyChain || !config.supplyChain.units || config.supplyChain.units.length === 0)) {
      alert('Please select at least one supply chain unit');
      return;
    }
    if (step === 2 && (!config.dataSource || !config.dataSource.type)) {
      alert('Please select a data source');
      return;
    }
    if (step === 2 && config.dataSource.type === 'api' && !config.dataSource.credentials) {
      alert('Please provide API credentials');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL is not configured. Please set REACT_APP_API_URL in your .env file.');
      }

      // Update sync status to in progress
      setConfig(prev => ({
        ...prev,
        sync: {
          ...prev.sync,
          status: 'pending',
          progress: 0,
          errors: []
        }
      }));

      // Validate API credentials if API is selected
      if (config.dataSource.type === 'zoho' || config.dataSource.type === 'odoo') {
        const response = await fetch(`${apiUrl}/api/validate-credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            type: config.dataSource.type,
            credentials: config.dataSource.credentials
          }),
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response. Please check if the API endpoint is correct.');
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to validate API credentials');
        }
      }

      // Save configuration to backend
      const saveResponse = await fetch(`${apiUrl}/api/user/configuration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          config: {
            ...config,
            dataSource: {
              ...config.dataSource,
              credentials: {
                ...config.dataSource.credentials,
                // Mask sensitive data before sending to frontend
                ...(config.dataSource.type === 'zoho' && {
                  clientSecret: '********',
                }),
                ...(config.dataSource.type === 'odoo' && {
                  password: '********',
                }),
              }
            }
          }
        }),
      });

      // Check if response is JSON
      const saveContentType = saveResponse.headers.get('content-type');
      if (!saveContentType || !saveContentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the API endpoint is correct.');
      }

      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.message || 'Failed to save configuration');
      }

      // Start initial sync with progress tracking
      const syncResponse = await fetch(`${apiUrl}/api/sync/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          config: config.dataSource
        }),
      });

      // Check if response is JSON
      const syncContentType = syncResponse.headers.get('content-type');
      if (!syncContentType || !syncContentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the API endpoint is correct.');
      }

      const syncData = await syncResponse.json();
      if (!syncResponse.ok) {
        throw new Error(syncData.message || 'Failed to start data sync');
      }

      // Start polling for sync progress
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`${apiUrl}/api/sync/progress/${user.uid}`);
          const progressData = await progressResponse.json();

          setConfig(prev => ({
            ...prev,
            sync: {
              ...prev.sync,
              progress: progressData.progress,
              status: progressData.status,
              errors: progressData.errors || []
            }
          }));

          if (progressData.status === 'success' || progressData.status === 'error') {
            clearInterval(pollInterval);
            if (progressData.status === 'success') {
              navigate('/dashboard');
            }
          }
        } catch (error) {
          console.error('Failed to fetch sync progress:', error);
          clearInterval(pollInterval);
          setConfig(prev => ({
            ...prev,
            sync: {
              ...prev.sync,
              status: 'error',
              errors: [...prev.sync.errors, 'Failed to track sync progress']
            }
          }));
        }
      }, 2000); // Poll every 2 seconds

    } catch (error) {
      console.error('Failed to save configuration:', error);
      let errorMessage = 'Failed to save configuration. ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Please check if:\n1. The API server is running\n2. Your internet connection is working\n3. The API URL is correct';
      } else {
        errorMessage += error.message;
      }
      setConfig(prev => ({
        ...prev,
        sync: {
          ...prev.sync,
          status: 'error',
          errors: [errorMessage]
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Setup Your Platform</h1>
              <div className="text-gray-400">Step {step} of 3</div>
            </div>
            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && (
            <SupplyChainStep
              config={config.supplyChain}
              onSelect={handleSupplyChainSelection}
            />
          )}

          {step === 2 && (
            <DataSourceStep
              config={config.dataSource}
              onSelect={handleDataSourceSelection}
              onCredentialUpdate={handleCredentialUpdate}
              onMappingUpdate={handleMappingUpdate}
            />
          )}

          {step === 3 && (
            <SyncStatusStep
              config={config.sync}
              onRetry={() => {
                setConfig(prev => ({
                  ...prev,
                  sync: {
                    ...prev.sync,
                    status: 'pending',
                    progress: 0,
                    errors: []
                  }
                }));
              }}
            />
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02]"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02]"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="ml-auto px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02]"
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SupplyChainStep = ({ config, onSelect }) => {
  const units = [
    { id: 'warehouse', name: 'Warehouse', icon: '🏭' },
    { id: 'retailer', name: 'Retailer', icon: '🏪' },
    { id: 'distributor', name: 'Distributor', icon: '🚛' },
    { id: 'manufacturer', name: 'Manufacturer', icon: '⚙️' },
    { id: 'supplier', name: 'Supplier', icon: '📦' },
    { id: 'transporter', name: 'Transporter', icon: '🚚' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Configure Your Supply Chain</h2>
      <p className="text-gray-400 mb-6">Select the units in your supply chain and configure inventory tracking</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map(unit => (
          <UnitCard
            key={unit.id}
            unit={unit}
            selected={config.units.includes(unit.id)}
            trackingEnabled={config.inventoryTracking[unit.id]}
            onSelect={() => onSelect(unit.id, !config.inventoryTracking[unit.id])}
          />
        ))}
      </div>
    </div>
  );
};

const DataSourceStep = ({ config, onSelect, onCredentialUpdate, onMappingUpdate }) => {
  const dataSources = [
    { id: 'zoho', name: 'Zoho Inventory', icon: '📊' },
    { id: 'odoo', name: 'Odoo', icon: '🔄' },
    { id: 'csv', name: 'CSV Import', icon: '📄' }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Connect Your Data Source</h2>
      <p className="text-gray-400 mb-6">Choose how you want to import your data</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {dataSources.map(source => (
          <DataSourceCard
            key={source.id}
            source={source}
            selected={config.type === source.id}
            onClick={() => onSelect(source.id)}
          />
        ))}
      </div>

      {config.type && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Connection Details</h3>
          {config.type === 'csv' ? (
            <CSVUploader onMappingUpdate={onMappingUpdate} />
          ) : (
            <APICredentials
              type={config.type}
              credentials={config.credentials}
              onUpdate={onCredentialUpdate}
            />
          )}
        </div>
      )}
    </div>
  );
};

const SyncStatusStep = ({ config, onRetry }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Initial Data Sync</h2>
      <p className="text-gray-400 mb-6">We're setting up your data integration</p>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              config.status === 'success' ? 'bg-green-500' :
              config.status === 'error' ? 'bg-red-500' :
              'bg-blue-500 animate-pulse'
            }`} />
            <span className="font-medium">
              {config.status === 'success' ? 'Sync Complete' :
               config.status === 'error' ? 'Sync Failed' :
               'Syncing Data...'}
            </span>
          </div>
          {config.status === 'error' && (
            <button
              onClick={onRetry}
              className="text-blue-500 hover:text-blue-400"
            >
              Retry
            </button>
          )}
        </div>

        {config.status === 'pending' && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${config.progress}%` }}
            />
          </div>
        )}

        {config.errors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-red-500 font-medium mb-2">Errors:</h4>
            <ul className="list-disc list-inside text-gray-400">
              {config.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const UnitCard = ({ unit, selected, trackingEnabled, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      selected
        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
        : 'border-gray-700 hover:border-gray-600'
    }`}
  >
    <div className="flex items-center">
      <span className="text-2xl mr-3">{unit.icon}</span>
      <div className="flex-grow">
        <h3 className="font-medium">{unit.name}</h3>
        <div className="mt-2">
          <label className="flex items-center text-sm text-gray-400">
            <input
              type="checkbox"
              checked={trackingEnabled}
              onChange={(e) => e.stopPropagation()}
              className="mr-2"
            />
            Track Inventory
          </label>
        </div>
      </div>
      <div
        className={`w-6 h-6 rounded-full border-2 ml-4 flex items-center justify-center ${
          selected ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
        }`}
      >
        {selected && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  </div>
);

const DataSourceCard = ({ source, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-lg border-2 text-center transition-all ${
      selected
        ? 'border-blue-500 bg-blue-500 bg-opacity-20'
        : 'border-gray-700 hover:border-gray-600'
    }`}
  >
    <span className="text-3xl mb-2 block">{source.icon}</span>
    <h3 className="font-medium">{source.name}</h3>
  </button>
);

const APICredentials = ({ type, credentials, onUpdate }) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);

  const getApiUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured. Please set REACT_APP_API_URL in your .env file.');
    }
    return apiUrl;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'clientId':
      case 'organizationId':
        return value.length > 0 ? null : 'This field is required';
      case 'clientSecret':
        return value.length >= 8 ? null : 'Client secret must be at least 8 characters';
      case 'database':
      case 'username':
        return value.length > 0 ? null : 'This field is required';
      case 'password':
        return value.length >= 6 ? null : 'Password must be at least 6 characters';
      case 'serverUrl':
        try {
          new URL(value);
          return null;
        } catch {
          return 'Please enter a valid URL';
        }
      default:
        return null;
    }
  };

  const validateCredentials = async () => {
    setIsValidating(true);
    setErrors({});
    setValidationStatus(null);

    // Validate all fields first
    const fieldErrors = {};
    Object.entries(credentials).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        fieldErrors[key] = error;
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setIsValidating(false);
      return false;
    }
    
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/validate-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type,
          credentials
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the API endpoint is correct.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate credentials');
      }

      setValidationStatus('success');
      return true;
    } catch (error) {
      let errorMessage = 'Failed to connect to the server. ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Please check if:\n1. The API server is running\n2. Your internet connection is working\n3. The API URL is correct';
      } else {
        errorMessage += error.message;
      }
      setErrors({ general: errorMessage });
      setValidationStatus('error');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({ ...prev, [name]: null }));
    setValidationStatus(null);
    onUpdate({
      ...credentials,
      [name]: value
    });
  };

  const renderFields = () => {
    switch (type) {
      case 'zoho':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Client ID *</label>
              <input
                type="text"
                name="clientId"
                value={credentials.clientId || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.clientId ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Secret *</label>
              <input
                type="password"
                name="clientSecret"
                value={credentials.clientSecret || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.clientSecret ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.clientSecret && <p className="text-red-500 text-sm mt-1">{errors.clientSecret}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization ID *</label>
              <input
                type="text"
                name="organizationId"
                value={credentials.organizationId || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.organizationId ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.organizationId && <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>}
            </div>
          </>
        );
      case 'odoo':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Database *</label>
              <input
                type="text"
                name="database"
                value={credentials.database || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.database ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.database && <p className="text-red-500 text-sm mt-1">{errors.database}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                name="username"
                value={credentials.username || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.username ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                name="password"
                value={credentials.password || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.password ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Server URL *</label>
              <input
                type="text"
                name="serverUrl"
                value={credentials.serverUrl || ''}
                onChange={handleChange}
                placeholder="https://your-odoo-instance.com"
                className={`w-full px-3 py-2 bg-gray-700 border ${
                  errors.serverUrl ? 'border-red-500' : 'border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.serverUrl && <p className="text-red-500 text-sm mt-1">{errors.serverUrl}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderFields()}
      {errors.general && (
        <p className="text-red-500 text-sm mt-2">{errors.general}</p>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={validateCredentials}
          disabled={isValidating}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Validating...' : 'Validate Connection'}
        </button>
        {validationStatus === 'success' && (
          <span className="text-green-500 text-sm mt-4">✓ Connection validated successfully</span>
        )}
        {validationStatus === 'error' && (
          <span className="text-red-500 text-sm mt-4">✗ Connection validation failed</span>
        )}
      </div>
    </div>
  );
};

const CSVUploader = ({ onMappingUpdate }) => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        const lines = csvData.split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid');
        }

        // Get headers from first line
        const csvHeaders = lines[0].split(',').map(header => header.trim());
        setHeaders(csvHeaders);

        // Initialize mapping with empty values
        const initialMapping = {};
        csvHeaders.forEach(header => {
          initialMapping[header] = '';
        });
        setMapping(initialMapping);
        onMappingUpdate(initialMapping);
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      setError('Failed to process CSV file: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (header, value) => {
    const newMapping = {
      ...mapping,
      [header]: value
    };
    setMapping(newMapping);
    onMappingUpdate(newMapping);
  };

  const requiredFields = [
    'product_id',
    'product_name',
    'quantity',
    'unit_price',
    'warehouse'
  ];

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
          disabled={isProcessing}
        />
        <label
          htmlFor="csv-upload"
          className={`cursor-pointer block ${isProcessing ? 'opacity-50' : ''}`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-400">
            {isProcessing ? 'Processing...' : 'Drag and drop your CSV file here, or click to select'}
          </p>
        </label>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      {headers.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Map CSV Columns</h4>
          <p className="text-sm text-gray-400 mb-4">
            Map your CSV columns to the required fields. Fields marked with * are required.
          </p>
          <div className="space-y-4">
            {headers.map(header => (
              <div key={header} className="flex items-center gap-4">
                <label className="flex-1 text-sm font-medium">
                  {header}
                  {requiredFields.includes(header) && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={mapping[header] || ''}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select field...</option>
                  {requiredFields.map(field => (
                    <option key={field} value={field}>
                      {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;