import React, { useState, useEffect, useCallback } from 'react';
import { Switch } from '@headlessui/react';
import axios from 'axios';

const IntegrationSettings = () => {
  const [odooEnabled, setOdooEnabled] = useState(false);
  const [zohoEnabled, setZohoEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    odoo: {
      url: '',
      username: '',
      api_key: '',
      database_name: '',
      company_id: '',
      is_validated: false
    },
    zoho: {
      url: '',
      username: '',
      api_key: '',
      is_validated: false
    }
  });
  const [companies, setCompanies] = useState([]);

  // Fetch Odoo companies - memoized to avoid recreation on every render
  const fetchOdooCompanies = useCallback(async () => {
    const { url, username, api_key, database_name } = settings.odoo;
    
    // Only fetch if all required fields are present
    if (!url || !username || !api_key || !database_name) {
      return;
    }
    
    try {
      setCompaniesLoading(true);
      setError(null);
      
      const response = await axios.get('/api/settings/companies', {
        params: {
          platform: 'odoo',
          url,
          database: database_name,
          username,
          api_key
        }
      });

      if (response.data && response.data.companies) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch companies: ' + (error.response?.data?.error || error.message));
    } finally {
      setCompaniesLoading(false);
    }
  }, [settings.odoo]);

  // Fetch existing integration settings
  useEffect(() => {
    const fetchSettings = async () => {
      setPageLoading(true);
      try {
        const response = await axios.get('/api/settings/integration');
        if (response.data && response.data.settings) {
          const data = response.data.settings;
          
          // Update settings state and toggle enabled state
          if (data.integration_type === 'Odoo') {
            setOdooEnabled(true);
            setSettings(prev => ({
              ...prev,
              odoo: {
                url: data.url || '',
                username: data.username || '',
                api_key: data.api_key || '',
                database_name: data.database_name || '',
                company_id: data.company_id || '',
                is_validated: data.is_validated || false
              }
            }));
          } else if (data.integration_type === 'Zoho') {
            setZohoEnabled(true);
            setSettings(prev => ({
              ...prev,
              zoho: {
                url: data.url || '',
                username: data.username || '',
                api_key: data.api_key || '',
                is_validated: data.is_validated || false
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching integration settings:', error);
        setError('Failed to load integration settings');
      } finally {
        setPageLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Fetch companies when settings change and validation is true
  useEffect(() => {
    if (settings.odoo.is_validated) {
      fetchOdooCompanies();
    }
  }, [settings.odoo.is_validated, fetchOdooCompanies]);

  const handleOdooChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      odoo: {
        ...prev.odoo,
        [field]: value
      }
    }));

    // Reset validation when fields change - but not when selecting a company
    if (settings.odoo.is_validated && field !== 'company_id') {
      setSettings(prev => ({
        ...prev,
        odoo: {
          ...prev.odoo,
          is_validated: false,
          company_id: ''
        }
      }));
      setCompanies([]);
    }
  };

  const handleZohoChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      zoho: {
        ...prev.zoho,
        [field]: value
      }
    }));

    // Reset validation when fields change
    if (settings.zoho.is_validated) {
      setSettings(prev => ({
        ...prev,
        zoho: {
          ...prev.zoho,
          is_validated: false
        }
      }));
    }
  };

  const validateOdooConnection = async () => {
    setValidating(true);
    setError(null);
    setSuccess(null);
    setCompanies([]);

    try {
      const response = await axios.post('/api/settings/validate-connection', {
        integration_type: 'Odoo',
        url: settings.odoo.url,
        database_name: settings.odoo.database_name,
        username: settings.odoo.username,
        api_key: settings.odoo.api_key
      });

      if (response.data && response.data.success) {
        setSuccess('Odoo connection validated successfully');
        setSettings(prev => ({
          ...prev,
          odoo: {
            ...prev.odoo,
            is_validated: true
          }
        }));
        
        // After successful validation, immediately attempt to fetch companies
        setTimeout(() => {
          fetchOdooCompanies();
        }, 500);
      } else {
        setError(response.data?.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Error validating connection:', error);
      setError(error.response?.data?.error || 'Failed to validate connection');
    } finally {
      setValidating(false);
    }
  };

  const validateZohoConnection = async () => {
    setValidating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/settings/validate-connection', {
        integration_type: 'Zoho',
        url: settings.zoho.url,
        username: settings.zoho.username,
        api_key: settings.zoho.api_key
      });

      if (response.data && response.data.success) {
        setSuccess('Zoho connection validated successfully');
        setSettings(prev => ({
          ...prev,
          zoho: {
            ...prev.zoho,
            is_validated: true
          }
        }));
      } else {
        setError(response.data?.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Error validating connection:', error);
      setError(error.response?.data?.error || 'Failed to validate connection');
    } finally {
      setValidating(false);
    }
  };

  const saveSettings = async (integrationType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let data;
      if (integrationType === 'Odoo') {
        data = {
          integration_type: 'Odoo',
          url: settings.odoo.url,
          database_name: settings.odoo.database_name,
          username: settings.odoo.username,
          api_key: settings.odoo.api_key,
          company_id: settings.odoo.company_id
        };
      } else if (integrationType === 'Zoho') {
        data = {
          integration_type: 'Zoho',
          url: settings.zoho.url,
          username: settings.zoho.username,
          api_key: settings.zoho.api_key
        };
      }

      const response = await axios.post('/api/settings/integration', data);
      
      if (response.data) {
        setSuccess(`${integrationType} integration settings saved successfully`);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6 bg-white dark:bg-[#151D2E] rounded-lg flex justify-center items-center" style={{ minHeight: '400px' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading integration settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#151D2E] rounded-lg">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Integration Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Configure your third-party integrations for enhanced functionality</p>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Odoo Integration */}
      <div className="mb-8 bg-gray-50 dark:bg-[#1E2736] p-6 rounded-lg border border-gray-200 dark:border-[#242F46]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
              <img 
                src="/images/odoo.png" 
                alt="Odoo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Odoo Integration</h2>
          </div>
          <Switch
            checked={odooEnabled}
            onChange={setOdooEnabled}
            className={`${
              odooEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span className="sr-only">Enable Odoo integration</span>
            <span
              className={`${
                odooEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {odooEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Odoo URL</label>
              <input
                type="text"
                placeholder="https://your-odoo-instance.com"
                value={settings.odoo.url}
                onChange={(e) => handleOdooChange('url', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                placeholder="your-username"
                value={settings.odoo.username}
                onChange={(e) => handleOdooChange('username', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <input
                type="password"
                placeholder="your-api-key"
                value={settings.odoo.api_key}
                onChange={(e) => handleOdooChange('api_key', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database</label>
              <input
                type="text"
                placeholder="your-database"
                value={settings.odoo.database_name}
                onChange={(e) => handleOdooChange('database_name', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={validateOdooConnection}
                disabled={validating || loading || !settings.odoo.url || !settings.odoo.username || !settings.odoo.api_key || !settings.odoo.database_name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {validating ? 'Validating...' : 'Validate Connection'}
              </button>

              {settings.odoo.is_validated && (
                <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connection Validated
                </span>
              )}
            </div>

            {settings.odoo.is_validated && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Company</label>
                {companiesLoading ? (
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="animate-spin h-5 w-5 border-b-2 border-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loading companies...</span>
                  </div>
                ) : companies.length > 0 ? (
                  <select
                    value={settings.odoo.company_id}
                    onChange={(e) => handleOdooChange('company_id', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 text-sm text-yellow-600 dark:text-yellow-400 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    No companies found. Try refreshing or check connection details.
                    <button 
                      onClick={fetchOdooCompanies}
                      className="ml-2 underline text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            )}

            {settings.odoo.is_validated && (
              <div className="flex justify-end pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => saveSettings('Odoo')}
                  disabled={loading || !settings.odoo.company_id}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zoho Integration */}
      <div className="mb-8 bg-gray-50 dark:bg-[#1E2736] p-6 rounded-lg border border-gray-200 dark:border-[#242F46]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
              <img 
                src="/images/zoho.png" 
                alt="Zoho" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Zoho Integration</h2>
          </div>
          <Switch
            checked={zohoEnabled}
            onChange={setZohoEnabled}
            className={`${
              zohoEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <span className="sr-only">Enable Zoho integration</span>
            <span
              className={`${
                zohoEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {zohoEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoho URL</label>
              <input
                type="text"
                placeholder="https://your-zoho-url.com"
                value={settings.zoho.url}
                onChange={(e) => handleZohoChange('url', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                placeholder="your-username"
                value={settings.zoho.username}
                onChange={(e) => handleZohoChange('username', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <input
                type="password"
                placeholder="Enter your Zoho API key"
                value={settings.zoho.api_key}
                onChange={(e) => handleZohoChange('api_key', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151D2E] border border-gray-300 dark:border-[#242F46] rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={validateZohoConnection}
                disabled={validating || loading || !settings.zoho.url || !settings.zoho.username || !settings.zoho.api_key}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {validating ? 'Validating...' : 'Validate Connection'}
              </button>

              {settings.zoho.is_validated && (
                <span className="text-green-600 dark:text-green-400 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connection Validated
                </span>
              )}
            </div>

            {settings.zoho.is_validated && (
              <div className="flex justify-end pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => saveSettings('Zoho')}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationSettings; 