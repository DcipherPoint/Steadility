import api from './api';

// Mock data for development
const mockMetrics = {
  carbonReduction: {
    value: '2,450 kg',
    change: '+12%',
    changeType: 'increase',
    description: 'Total CO2 emissions reduced through optimized routes',
  },
  fuelSavings: {
    value: '1,850 L',
    change: '+8%',
    changeType: 'increase',
    description: 'Fuel saved through route optimization',
  },
  timeEfficiency: {
    value: '92%',
    change: '+5%',
    changeType: 'increase',
    description: 'Average delivery time efficiency',
  },
  costSavings: {
    value: '$4,250',
    change: '+15%',
    changeType: 'increase',
    description: 'Total operational cost savings',
  },
};

const mockCarbonCredits = {
  available: 245,
  used: 82,
};

const mockEnvironmentalImpact = {
  treesEquivalent: 245,
  waterSaved: 1850,
};

// Service functions
export const analyticsService = {
  // Get all metrics
  getMetrics: async () => {
    try {
      const response = await api.get('/analytics/metrics');
      return response;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  },

  // Get carbon credits data
  getCarbonCredits: async () => {
    try {
      const response = await api.get('/analytics/carbon-credits');
      return response;
    } catch (error) {
      console.error('Error fetching carbon credits:', error);
      throw error;
    }
  },

  // Get environmental impact data
  getEnvironmentalImpact: async () => {
    try {
      const response = await api.get('/analytics/environmental-impact');
      return response;
    } catch (error) {
      console.error('Error fetching environmental impact:', error);
      throw error;
    }
  },

  // Get historical data for charts
  getHistoricalData: async (timeframe) => {
    try {
      if (!timeframe) {
        throw new Error('Timeframe parameter is required');
      }
      const response = await api.get(`/analytics/historical?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },

  // Generate sustainability report
  generateReport: async (params) => {
    try {
      const response = await api.post('/analytics/report', params);
      return response;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Get inventory data
  getInventory: async () => {
    try {
      const response = await api.get('/analytics/inventory');
      return response;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Get sales data
  getSales: async () => {
    try {
      const response = await api.get('/analytics/sales');
      return response;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }
};