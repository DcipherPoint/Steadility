import React, { useState } from 'react';
import { validateApiCredentials } from '../../services/importService';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const apiFields = {
  odoo: [
    { id: 'url', label: 'Server URL', type: 'text' },
    { id: 'database', label: 'Database Name', type: 'text' },
    { id: 'apiKey', label: 'API Key', type: 'password' },
  ],
  zoho: [
    { id: 'organizationId', label: 'Organization ID', type: 'text' },
    { id: 'apiKey', label: 'API Key', type: 'password' },
    { id: 'region', label: 'Region', type: 'text' },
  ],
  sap: [
    { id: 'systemId', label: 'System ID', type: 'text' },
    { id: 'client', label: 'Client', type: 'text' },
    { id: 'username', label: 'Username', type: 'text' },
    { id: 'password', label: 'Password', type: 'password' },
  ],
  netsuite: [
    { id: 'accountId', label: 'Account ID', type: 'text' },
    { id: 'consumerKey', label: 'Consumer Key', type: 'text' },
    { id: 'consumerSecret', label: 'Consumer Secret', type: 'password' },
    { id: 'tokenId', label: 'Token ID', type: 'text' },
    { id: 'tokenSecret', label: 'Token Secret', type: 'password' },
  ],
};

const steps = ['Select Data Source', 'Enter API Credentials', 'Map Fields', 'Review & Confirm'];

const ApiCredentials = ({ onAuthenticated }) => {
  const [selectedSource, setSelectedSource] = useState('odoo');
  const [credentials, setCredentials] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleInputChange = (fieldId, value) => {
    setCredentials((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setIsValid(false);
    setError(null);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setError(null);

    try {
      await validateApiCredentials(selectedSource, credentials);
      setIsValid(true);
      onAuthenticated(true);
    } catch (err) {
      setError(err.message);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const fields = apiFields[selectedSource] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">API Credentials</h2>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-700">
          <div 
            className="absolute h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= activeStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-900 text-gray-400 border border-gray-700'
              }`}>
                {index + 1}
              </div>
              <div className="mt-2 text-xs font-medium text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(apiFields).map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedSource === source
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 hover:border-blue-500 bg-gray-900/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedSource === source
                      ? 'bg-blue-900/40'
                      : 'bg-gray-800'
                  }`}>
                    <QuestionMarkCircleIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white capitalize">{source}</p>
                    <p className="text-sm text-gray-400">Connect to {source.toUpperCase()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={credentials[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}

            {error && (
              <div className="flex items-start space-x-3 p-3 bg-red-900/20 rounded-lg border border-red-700/50">
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {isValid && (
              <div className="flex items-start space-x-3 p-3 bg-green-900/20 rounded-lg border border-green-700/50">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm text-green-400">Connection validated successfully!</p>
              </div>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Field mapping will be handled in the next step.</p>
          </div>
        )}

        {activeStep === 3 && (
          <div className="text-center py-8">
            <p className="text-gray-400">Review your settings before completing the setup.</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-700">
        <button
          onClick={handleBack}
          disabled={activeStep === 0}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-4">
          {activeStep === 1 && (
            <button
              onClick={handleValidate}
              disabled={isValidating || Object.keys(credentials).length === 0}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validating...
                </>
              ) : (
                'Validate Connection'
              )}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Help Link */}
      <div className="text-center">
        <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
          Need help? Click here for documentation.
        </a>
      </div>
    </div>
  );
};

export default ApiCredentials;
