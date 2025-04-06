import React, { useState } from 'react';
import { fetchOdooInventory } from '../../services/aiFeaturesService';

const InventoryTest = () => {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOdooInventory();
      if (result.success) {
        setInventory(result.data);
      } else {
        setError(result.message || 'Failed to fetch inventory data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inventory Data</h2>
      
      <button
        onClick={handleFetchInventory}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Inventory'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {inventory && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Inventory Data:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(inventory, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default InventoryTest; 