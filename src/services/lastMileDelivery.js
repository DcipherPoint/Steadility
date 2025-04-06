import axios from 'axios';

/**
 * Optimize last-mile delivery routes using the server-side IAFSA algorithm
 * 
 * @param {Object} params Route optimization parameters
 * @param {string} params.startPoint Starting location
 * @param {Array<string>} params.destinations List of destination addresses
 * @param {Object} params.weights Weight priorities for optimization
 * @param {number} params.weights.time Time priority (0-1)
 * @param {number} params.weights.cost Cost priority (0-1)
 * @param {number} params.weights.carbon Carbon priority (0-1)
 * @param {number} params.fuelCostPerKm Fuel cost per kilometer
 * @param {Array<string>} params.comparison Comparison methods to include
 * @returns {Promise<Object>} Optimization results
 */
export const optimizeRoute = async (params) => {
  try {
    const response = await axios.post('/api/last-mile-delivery/optimize', params);
    return response.data;
  } catch (error) {
    console.error('Route optimization failed:', error);
    throw error;
  }
};

/**
 * Format route data for display on the map
 * 
 * @param {Object} routeData Route data from the API response
 * @returns {Object} Formatted data for UI display
 */
export const formatRouteData = (routeData) => {
  if (!routeData) return null;
  
  return {
    distance: routeData.distance.toFixed(2),
    cost: routeData.cost.toFixed(2),
    carbon: routeData.carbon.toFixed(2),
    directions: routeData.directions
  };
};

/**
 * Calculate carbon credits based on carbon savings
 * 
 * @param {Object} iafsaResults IAFSA optimization results
 * @param {Object} ortoolsResults OR-Tools optimization results
 * @returns {number} Carbon credits earned
 */
export const calculateCarbonCredits = (iafsaResults, ortoolsResults) => {
  if (!iafsaResults || !ortoolsResults) return 0;
  
  const savings = ortoolsResults.carbon - iafsaResults.carbon;
  // Use a credit multiplier (e.g., 0.5 credits per kg CO2 saved)
  return Math.max(0, savings * 0.5);
};

/**
 * Validate route optimization input data
 * 
 * @param {Object} params Route parameters to validate
 * @returns {Object} Validation result {isValid, message}
 */
export const validateRouteInput = (params) => {
  const { startPoint, destinations } = params;
  
  if (!startPoint || !startPoint.trim()) {
    return { isValid: false, message: 'Start point is required' };
  }
  
  if (!destinations || !destinations.length) {
    return { isValid: false, message: 'At least one destination is required' };
  }
  
  return { isValid: true };
};

/**
 * Generate a sample route for testing
 * 
 * @returns {Object} Sample route data
 */
export const getSampleRouteData = () => {
  return {
    startPoint: 'San Francisco, CA, USA',
    destinations: [
      'Oakland, CA, USA',
      'Berkeley, CA, USA',
      'San Jose, CA, USA',
      'Palo Alto, CA, USA',
      'Redwood City, CA, USA'
    ]
  };
}; 