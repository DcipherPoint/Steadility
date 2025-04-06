import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useInventory } from '../../../contexts/InventoryContext';
import { 
  Cog6ToothIcon,
  BellIcon,
  UserIcon,
  KeyIcon,
  GlobeAltIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import IntegrationSettings from '../../../components/dashboard/settings/IntegrationSettings';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('configure');
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { 
    configureOptions, 
    updateConfigOption, 
    saveConfigOptions, 
    configSaving, 
    configSaved 
  } = useInventory();
  
  const [profileForm, setProfileForm] = useState({
    companyName: user?.company_name || '',
    password: ''
  });
  const [securityForm, setSecurityForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profileStatus, setProfileStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  const [securityStatus, setSecurityStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  // Update profile form when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        companyName: user.company_name || ''
      }));
    }
  }, [user]);

  const settings = {
    notifications: {
      emailNotifications: true,
      lowStockAlerts: true,
      routeUpdates: true,
      maintenanceAlerts: false
    },
    integrations: {
      odoo: {
        connected: true,
        lastSync: '2024-03-15 14:30'
      },
      googleMaps: {
        connected: true,
        apiKey: '••••••••••••••••'
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleConfigureOptionChange = (option) => {
    updateConfigOption(option, !configureOptions[option]);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ loading: true, success: false, error: null });
    try {
      const response = await axios.post('/api/settings/profile', profileForm);
      setProfileStatus({ loading: false, success: true, error: null });
      setTimeout(() => setProfileStatus(prev => ({ ...prev, success: false })), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile' 
      });
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (securityForm.new_password !== securityForm.confirm_password) {
      setSecurityStatus({ 
        loading: false, 
        success: false, 
        error: 'New password and confirmation do not match' 
      });
      return;
    }
    
    setSecurityStatus({ loading: true, success: false, error: null });
    try {
      const response = await axios.post('/api/settings/security', securityForm);
      setSecurityStatus({ loading: false, success: true, error: null });
      setTimeout(() => setSecurityStatus(prev => ({ ...prev, success: false })), 3000);
      setSecurityForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setSecurityStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.error || 'Failed to update password' 
      });
    }
  };

  const tabs = [
    { id: 'configure', name: 'Configure', icon: Cog6ToothIcon },
    { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  return (
    <div className="py-8 space-y-6">
      {/* Settings Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${
                    activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400'
                  }`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            
            {activeTab === 'configure' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Supply Chain Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select your available or preferred supply chain units for tracking</p>
                <div className="space-y-4">
                  {Object.entries({
                    supplier: 'Supplier',
                    manufacturing: 'Manufacturing',
                    warehouse: 'Warehouse',
                    distributors: 'Distributors',
                    retailers: 'Retailers'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <input
                        id={`option-${key}`}
                        type="checkbox"
                        checked={configureOptions[key]}
                        onChange={() => handleConfigureOptionChange(key)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                      />
                      <label htmlFor={`option-${key}`} className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center">
                  <button 
                    onClick={saveConfigOptions}
                    disabled={configSaving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {configSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  {configSaved && (
                    <span className="ml-3 text-sm text-green-600 dark:text-green-400">
                      Preferences saved successfully!
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification Settings</h2>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <button
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            value ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <IntegrationSettings />
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Settings</h2>
                <form onSubmit={handleSecuritySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      value={securityForm.current_password}
                      onChange={handleSecurityChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      value={securityForm.new_password}
                      onChange={handleSecurityChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={securityForm.confirm_password}
                      onChange={handleSecurityChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={securityStatus.loading}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {securityStatus.loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  {securityStatus.success && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Password updated successfully!
                    </div>
                  )}
                  {securityStatus.error && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {securityStatus.error}
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={profileForm.companyName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.username || ""}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 opacity-75"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your email serves as your username and cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password for validation</label>
                    <input
                      type="password"
                      name="password"
                      value={profileForm.password}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your current password to confirm changes</p>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileStatus.loading}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {profileStatus.loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  {profileStatus.success && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Profile updated successfully!
                    </div>
                  )}
                  {profileStatus.error && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                      {profileStatus.error}
                    </div>
                  )}
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 