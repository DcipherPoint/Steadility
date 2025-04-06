import api from './api';

// Data validation helpers
const validateDataTypes = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }
  
  const errors = [];
  data.forEach((row, index) => {
    if (!row || typeof row !== 'object') {
      errors.push(`Row ${index + 1}: Invalid row format`);
      return;
    }
    if (row.quantity && isNaN(Number(row.quantity))) {
      errors.push(`Row ${index + 1}: Quantity must be a number`);
    }
    if (row.expiry_date && !isValidDate(row.expiry_date)) {
      errors.push(`Row ${index + 1}: Invalid date format`);
    }
  });
  return errors;
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validateData = async (data) => {
  try {
    const validationErrors = validateDataTypes(data);
    if (validationErrors.length > 0) {
      throw new Error(JSON.stringify(validationErrors));
    }
    
    const response = await api.post('/api/datasource/validate/', data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Server validation failed');
    }
    throw error;
  }
};

export const mapFields = (sourceData, targetFields) => {
  const mappedData = {};
  for (const [sourceField, targetField] of Object.entries(targetFields)) {
    if (sourceData[sourceField] !== undefined) {
      mappedData[targetField] = sourceData[sourceField];
    }
  }
  return mappedData;
};

export const processImport = async (data, source, onProgress) => {
  try {
    const batchSize = 100;
    const totalBatches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await api.post('/api/datasource/import/', { data: batch, source });
      
      if (onProgress) {
        const progress = Math.round(((i + batchSize) / data.length) * 100);
        onProgress(Math.min(progress, 100));
      }
    }
    
    return { success: true, message: 'Import completed successfully' };
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`);
  }
};

export const getFieldMappingTemplate = (source) => {
  const templates = {
    odoo: {
      'product_id': 'productId',
      'quantity': 'quantity',
      'location': 'location',
      'expiry_date': 'expiryDate',
    },
    zoho: {
      'item_id': 'productId',
      'stock_level': 'quantity',
      'warehouse': 'location',
      'expiry_date': 'expiryDate',
    },
    csv: {
      'product_id': 'productId',
      'quantity': 'quantity',
      'location': 'location',
      'expiry_date': 'expiryDate',
    }
  };
  return templates[source] || {};
};

export const validateApiCredentials = async (source, credentials) => {
  try {
    const response = await api.post('/api/datasource/validate-credentials/', { source, credentials });
    return response.data;
  } catch (error) {
    throw new Error('API validation failed: ' + error.message);
  }
};

export const downloadTemplate = (source) => {
  const templates = {
    csv: [
      'product_id,quantity,location,expiry_date',
      'PROD001,100,Warehouse A,2025-04-01',
      'PROD002,50,Warehouse B,2025-04-02',
    ].join('\n'),
  };
  return templates[source] || '';
};

export const getImportStatus = async (importId) => {
  try {
    const response = await api.get(`/api/import-status/${importId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch import status');
  }
};
