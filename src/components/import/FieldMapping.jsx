import React, { useState, useEffect } from 'react';
import { getFieldMappingTemplate } from '../../services/importService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const systemFields = [
  { id: 'productId', label: 'Product ID', required: true },
  { id: 'quantity', label: 'Quantity', required: true },
  { id: 'location', label: 'Location', required: true },
  { id: 'plannedDate', label: 'Planned Date', required: false },
  { id: 'status', label: 'Status', required: false },
  { id: 'priority', label: 'Priority', required: false },
];

const FieldMapping = ({ sourceData, dataSource, onMappingChange, onComplete, onBack }) => {
  const [mappings, setMappings] = useState({});
  const [autoMapped, setAutoMapped] = useState(false);

  useEffect(() => {
    if (!autoMapped && sourceData && sourceData.length > 0) {
      const template = getFieldMappingTemplate(dataSource);
      const headers = sourceData[0];
      const initialMappings = {};
      
      headers.forEach(header => {
        if (template[header]) {
          initialMappings[header] = template[header];
        }
      });
      
      setMappings(initialMappings);
      onMappingChange(initialMappings);
      setAutoMapped(true);
    }
  }, [sourceData, dataSource, autoMapped, onMappingChange]);

  const handleMappingChange = (sourceField, targetField) => {
    const newMappings = { ...mappings };
    
    Object.keys(newMappings).forEach(key => {
      if (newMappings[key] === targetField) {
        delete newMappings[key];
      }
    });
    
    if (targetField) {
      newMappings[sourceField] = targetField;
    } else {
      delete newMappings[sourceField];
    }
    
    setMappings(newMappings);
    onMappingChange(newMappings);
  };

  const isValidMapping = () => {
    const mappedFields = new Set(Object.values(mappings));
    return systemFields
      .filter(field => field.required)
      .every(field => mappedFields.has(field.id));
  };

  const sourceFields = sourceData?.[0] || [];
  const sampleData = sourceData?.[1] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Field Mapping</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            onClick={onComplete}
            disabled={!isValidMapping()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-900/50">
                Source Field
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-900/50">
                Sample Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-900/50">
                Map To
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sourceFields.map((field, index) => (
              <tr key={field} className="hover:bg-gray-900/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {field}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {sampleData[index]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={mappings[field] || ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="block w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Don't Map</option>
                    {systemFields.map(({ id, label, required }) => (
                      <option 
                        key={id} 
                        value={id}
                        disabled={Object.values(mappings).includes(id) && mappings[field] !== id}
                      >
                        {label} {required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-400">
        <p>* Required fields</p>
        <p className="mt-1">Map your source fields to the corresponding system fields. Required fields must be mapped to continue.</p>
      </div>
    </div>
  );
};

export default FieldMapping;
