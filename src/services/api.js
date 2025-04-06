// Mock API service for frontend-only operation
import axios from 'axios';

// Determine the baseURL based on environment
// In production, use relative URLs to call the same server the frontend is hosted on
// In development, use the localhost URL
const getBaseUrl = () => {
  // Check if we're in production (hostname is not localhost)
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    // Return an empty string to use relative URLs in production
    // This will make requests go to the same server that served the frontend
    return '';
  }
  // For local development, use the localhost API
  return 'http://127.0.0.1:5000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Received response from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      return Promise.reject({ 
        message: 'No response from server. Please check if the backend server is running.',
        details: error.message
      });
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      return Promise.reject({ 
        message: 'Request configuration error',
        details: error.message
      });
    }
  }
);

// Add wrapper methods with logging
api.customGet = async (endpoint) => {
  try {
    console.log('Making GET request to:', endpoint);
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('API GET request failed:', error);
    throw error;
  }
};

api.customPost = async (endpoint, body) => {
  try {
    console.log('Making POST request to:', endpoint, 'with body:', body);
    const response = await api.post(endpoint, body);
    return response.data;
  } catch (error) {
    console.error('API POST request failed:', error);
    throw error;
  }
};

api.customPut = async (endpoint, body) => {
  try {
    console.log('Making PUT request to:', endpoint, 'with body:', body);
    const response = await api.put(endpoint, body);
    return response.data;
  } catch (error) {
    console.error('API PUT request failed:', error);
    throw error;
  }
};

api.customDelete = async (endpoint) => {
  try {
    console.log('Making DELETE request to:', endpoint);
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error('API DELETE request failed:', error);
    throw error;
  }
};

export default api;