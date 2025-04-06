import api from './api';

// Inventory Optimization (Demand Forecasting, Dynamic Docking, Monitoring)
export const optimizeInventory = async (data) => {
  try {
    // Ensure required parameters are present
    const requiredParams = ['forecast_horizon', 'start_date', 'end_date'];
    const missingParams = requiredParams.filter(param => !data[param]);
    
    if (missingParams.length > 0) {
      // If start_date or end_date are missing but we have forecast_horizon, generate them
      if (missingParams.includes('start_date') || missingParams.includes('end_date')) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // Default to last 30 days of data
        
        data.end_date = data.end_date || endDate.toISOString().split('T')[0];
        data.start_date = data.start_date || startDate.toISOString().split('T')[0];
      }
    }
    
    // Ensure forecast_horizon is at least 2
    if (data.forecast_horizon < 2) {
      data.forecast_horizon = 2;
    }
    
    const response = await api.customPost('/api/forecasting/inventory-optimization', data);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    
    // Enhanced error handling
    if (error.response) {
      // Server responded with error
      if (error.response.data) {
        if (typeof error.response.data === 'object') {
          if (error.response.data.error) {
            throw error.response.data.error;
          } else if (error.response.data.message) {
            throw error.response.data.message;
          }
        } else if (typeof error.response.data === 'string') {
          throw error.response.data;
        }
      }
      throw `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response received
      throw "No response received from server. Please check your connection.";
    }
    
    // Default error message if we can't extract specific error
    throw error.message || "Failed to optimize inventory";
  }
};

// Fetch Odoo Inventory
export const fetchOdooInventory = async () => {
  try {
    const response = await api.customGet('/api/datasource/fetch-inventory');
    return response;
  } catch (error) {
    throw error;
  }
};

// Fetch Odoo Warehouse History
export const fetchOdooWarehouseHistory = async (days = 30) => {
  try {
    const response = await api.customGet(`/api/datasource/fetch-warehouse-history?days=${days}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Fetch Odoo Retailer History
export const fetchOdooRetailerHistory = async (days = 30) => {
  try {
    const response = await api.customGet(`/api/datasource/fetch-retailer-history?days=${days}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// List Odoo Products
export const listOdooProducts = async () => {
  try {
    const response = await api.customGet('/api/datasource/list-products');
    return response;
  } catch (error) {
    throw error;
  }
};

// List Odoo Locations
export const listOdooLocations = async () => {
  try {
    const response = await api.customGet('/api/datasource/list-locations');
    return response;
  } catch (error) {
    throw error;
  }
};

// Dynamic Rerouting with Gemini API
export const generateReroutingPlan = async (params) => {
  try {
    const response = await api.customPost('/api/rerouting/dynamic/', params);
    return response;
  } catch (error) {
    throw error;
  }
};

// Data Source Integration
export const connectDataSource = async (source, credentials) => {
  try {
    console.log('Connecting to data source:', source);
    console.log('Credentials:', credentials);

    // For CSV uploads, we need to handle file upload differently
    if (source === 'csv') {
      const formData = new FormData();
      formData.append('file', credentials.file);

      const response = await api.customPost('/api/datasource/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    }

    // For Zoho and Odoo, send credentials as JSON
    const response = await api.customPost('/api/datasource/connect', {
      source,
      credentials,
    });
    return response;
  } catch (error) {
    console.error('Error connecting to data source:', error);
    throw error;
  }
};

export const testDataSourceConnection = async (source, credentials) => {
  try {
    console.log('Testing connection to data source:', source);
    const response = await api.customPost('/api/datasource/test-connection', {
      source,
      credentials,
    });
    return response;
  } catch (error) {
    console.error('Error testing data source connection:', error);
    throw error;
  }
};

// Supply Chain Unit Selection
export const updateSupplyChainUnits = async (params) => {
  try {
    const response = await api.customPost('/api/onboarding/', params);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get Current Inventory
export const getCurrentInventory = async (params) => {
  try {
    const response = await api.customGet('/api/inventory/current/', { params });
    return response;
  } catch (error) {
    throw error;
  }
};

// Last Mile Delivery Optimization (Placeholder)
export const optimizeLastMileDelivery = async () => {
  try {
    const response = await api.customGet('/api/lastmile/optimize/');
    return response;
  } catch (error) {
    throw error;
  }
}; 