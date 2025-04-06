import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [inventoryData, setInventoryData] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    reorderPoints: 0,
    categories: [],
    recentMovements: []
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configureOptions, setConfigureOptions] = useState({
    supplier: false,
    manufacturing: false,
    warehouse: false,
    distributors: false,
    retailers: false
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [connectionValid, setConnectionValid] = useState(false);

  // Check if Odoo integration is valid
  const checkOdooConnection = useCallback(async () => {
    try {
      const response = await axios.get('/api/settings/integration');
      if (response.data && response.data.settings) {
        const data = response.data.settings;
        if (data.integration_type === 'Odoo' && data.is_validated) {
          setConnectionValid(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking Odoo connection:', error);
      return false;
    }
  }, []);

  // Fetch inventory data
  const fetchInventoryData = useCallback(async (force = false) => {
    // Only fetch data if:
    // 1. We're forcing a refresh, OR
    // 2. We haven't fetched data yet (lastUpdated is null), OR
    // 3. It's been more than 5 minutes since the last fetch
    const shouldFetch = force || 
      !lastUpdated || 
      (new Date() - lastUpdated > 5 * 60 * 1000);
    
    if (!shouldFetch) {
      return { cached: true, data: inventoryData };
    }

    // First check if Odoo integration is valid
    const isConnected = await checkOdooConnection();
    if (!isConnected) {
      setConnectionValid(false);
      return { cached: false, data: null, error: 'No valid Odoo connection found' };
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/inventory/dashboard');
      if (response.data.error) {
        setError(response.data.error);
        setLoading(false);
        return { cached: false, data: null, error: response.data.error };
      }
      
      // Transform the data to match our component's expected format
      const data = response.data.data;
      const formattedData = {
        totalItems: data.total_items,
        lowStock: data.low_stock,
        outOfStock: data.out_of_stock,
        reorderPoints: data.reorder_points,
        categories: data.categories.map(cat => ({
          name: cat.name,
          count: cat.count,
          status: determineStatus(cat.count)
        })),
        recentMovements: data.recent_movements.map(move => ({
          item: move.product,
          type: move.quantity > 0 ? 'in' : 'out',
          quantity: Math.abs(move.quantity),
          date: move.date
        }))
      };
      
      setInventoryData(formattedData);
      setLastUpdated(new Date());
      setLoading(false);
      return { cached: false, data: formattedData };
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to fetch inventory data');
      setLoading(false);
      return { cached: false, data: null, error: 'Failed to fetch inventory data' };
    }
  }, [lastUpdated, inventoryData, checkOdooConnection]);

  // Determine status based on count
  const determineStatus = (count) => {
    if (count > 400) return 'healthy';
    if (count > 200) return 'warning';
    return 'critical';
  };

  // Fetch supply chain configuration options
  const fetchConfigOptions = useCallback(async () => {
    try {
      const response = await axios.get('/api/settings/user-preferences');
      if (response.data && response.data.preferences) {
        setConfigureOptions(response.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  }, []);

  // Save supply chain configuration options
  const saveConfigOptions = useCallback(async () => {
    setConfigSaving(true);
    try {
      await axios.post('/api/settings/user-preferences', {
        preferences: configureOptions
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    } finally {
      setConfigSaving(false);
    }
  }, [configureOptions]);

  // Update a single configuration option
  const updateConfigOption = useCallback((option, value) => {
    setConfigureOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  // Initialize data when the user is logged in
  useEffect(() => {
    if (user) {
      // Only fetch inventory data if we have a valid connection
      checkOdooConnection().then(isValid => {
        if (isValid) {
          fetchInventoryData();
        }
      });
      fetchConfigOptions();
    }
  }, [user, fetchInventoryData, fetchConfigOptions, checkOdooConnection]);

  // Value to be provided by the context
  const value = {
    inventoryData,
    lastUpdated,
    loading,
    error,
    fetchInventoryData,
    configureOptions,
    updateConfigOption,
    saveConfigOptions,
    configSaving,
    configSaved,
    connectionValid
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext; 