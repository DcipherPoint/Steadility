import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const IntegrationSettings = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    odoo: {
      url: '',
      username: '',
      password: '',
      database: '',
      enabled: false
    },
    zoho: {
      clientId: '',
      clientSecret: '',
      refreshToken: '',
      enabled: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings/integrations');
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load integration settings');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/settings/integrations', settings);
      setSuccess('Integration settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update integration settings');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggle = (integration) => {
    setSettings(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        enabled: !prev[integration].enabled
      }
    }));
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Integration Settings
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Configure your third-party integrations for enhanced functionality
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Odoo Integration */}
          <div className={`bg-white shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="/images/odoo-icon.png" alt="Odoo" className="h-8 w-8 mr-3" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Odoo Integration
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('odoo')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.odoo.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.odoo.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Odoo URL
                </label>
                <input
                  type="url"
                  value={settings.odoo.url}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    odoo: { ...prev.odoo, url: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="https://your-odoo-instance.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username
                </label>
                <input
                  type="text"
                  value={settings.odoo.username}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    odoo: { ...prev.odoo, username: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-username"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={settings.odoo.password}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    odoo: { ...prev.odoo, password: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-password"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Database
                </label>
                <input
                  type="text"
                  value={settings.odoo.database}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    odoo: { ...prev.odoo, database: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-database"
                />
              </div>
            </div>
          </div>

          {/* Zoho Integration */}
          <div className={`bg-white shadow rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img src="/images/zoho-icon.png" alt="Zoho" className="h-8 w-8 mr-3" />
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Zoho Integration
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('zoho')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.zoho.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.zoho.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client ID
                </label>
                <input
                  type="text"
                  value={settings.zoho.clientId}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    zoho: { ...prev.zoho, clientId: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-client-id"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client Secret
                </label>
                <input
                  type="password"
                  value={settings.zoho.clientSecret}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    zoho: { ...prev.zoho, clientSecret: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-client-secret"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Refresh Token
                </label>
                <input
                  type="password"
                  value={settings.zoho.refreshToken}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    zoho: { ...prev.zoho, refreshToken: e.target.value }
                  }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                  }`}
                  placeholder="your-refresh-token"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntegrationSettings; 