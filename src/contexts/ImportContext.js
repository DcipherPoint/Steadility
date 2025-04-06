import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ImportContext = createContext();

export const useImport = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
};

export const ImportProvider = ({ children }) => {
  const { user, getAuthHeaders } = useAuth();
  const [importedData, setImportedData] = useState({
    odoo: [],
    zoho: [],
    csv: []
  });
  const [totalRecords, setTotalRecords] = useState({
    odoo: 0,
    zoho: 0,
    csv: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [hasImportedCSV, setHasImportedCSV] = useState(false);
  const [dataChecked, setDataChecked] = useState({
    odoo: false,
    zoho: false,
    csv: false
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Check for existing data for a specific source
  const checkExistingData = useCallback(async (source) => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await axios.get(`/api/import/${source}/history`, { headers });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setImportedData(prev => ({
          ...prev,
          [source]: response.data.data
        }));
        setTotalRecords(prev => ({
          ...prev,
          [source]: response.data.total_records || response.data.data.length
        }));
        setLastUpdated(new Date());
      }
      
      setDataChecked(prev => ({
        ...prev,
        [source]: true
      }));
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to access import history");
      } else {
        console.error(`Error checking existing ${source} data:`, err);
        setError(`Failed to fetch ${source.toUpperCase()} import history`);
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Import data from a specific source
  const importData = useCallback(async (source) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let response;

      if (source === 'csv' && csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        response = await axios.post('/api/import/csv', formData, { headers });
        
        if (response.data.data) {
          setImportedData(prev => ({
            ...prev,
            csv: [...prev.csv, ...response.data.data]
          }));
          setTotalRecords(prev => ({
            ...prev,
            csv: response.data.total_records || response.data.data.length
          }));
          setHasImportedCSV(true);
          setCsvFile(null);
        }
      } else {
        response = await axios.post(`/api/import/${source}/fetch`, {}, { headers });
        if (response.data.data) {
          setImportedData(prev => ({
            ...prev,
            [source]: response.data.data
          }));
          setTotalRecords(prev => ({
            ...prev,
            [source]: response.data.total_records || response.data.data.length
          }));
        }
      }
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to import data");
      } else {
        setError(err.response?.data?.error || `Failed to import data from ${source}`);
        console.error('Import error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders, csvFile]);

  // Save data to database for a specific source
  const saveData = useCallback(async (source) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      
      await axios.post(`/api/import/${source}/save`, {}, { headers });
      
      // Reset data
      setImportedData(prev => ({
        ...prev,
        [source]: []
      }));
      
      setTotalRecords(prev => ({
        ...prev,
        [source]: 0
      }));
      
      if (source === 'csv') {
        setHasImportedCSV(false);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to save data");
      } else {
        setError(err.response?.data?.error || `Failed to save ${source} data`);
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle CSV file selection
  const handleFileChange = useCallback((file) => {
    setCsvFile(file);
  }, []);

  // Reload data for a specific source (for refresh button)
  const refreshData = useCallback(async (source) => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      
      // Fetch data directly from MySQL database instead of external sources
      const response = await axios.get(`/api/import/${source}/stored-data`, { headers });
      
      if (response.data && response.data.data) {
        setImportedData(prev => ({
          ...prev,
          [source]: response.data.data
        }));
        setTotalRecords(prev => ({
          ...prev,
          [source]: response.data.total_records || response.data.data.length
        }));
        setLastUpdated(new Date());
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in to access import history");
      } else {
        console.error(`Error refreshing ${source} data:`, err);
        setError(`Failed to refresh ${source.toUpperCase()} data`);
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Clear error message
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data when user is logged in
  useEffect(() => {
    if (user) {
      checkExistingData('odoo');
      checkExistingData('zoho');
      checkExistingData('csv');
    }
  }, [user, checkExistingData]);

  // Value to be provided by the context
  const value = {
    importedData,
    totalRecords,
    loading,
    error,
    csvFile,
    hasImportedCSV,
    dataChecked,
    lastUpdated,
    checkExistingData,
    importData,
    saveData,
    handleFileChange,
    refreshData,
    clearError
  };

  return (
    <ImportContext.Provider value={value}>
      {children}
    </ImportContext.Provider>
  );
};

export default ImportContext; 