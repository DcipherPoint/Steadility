import React, { useState } from 'react';
import { generateReroutingPlan } from '../../services/aiFeaturesService';

const DynamicRerouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reroutingPlan, setReroutingPlan] = useState(null);
  const [formData, setFormData] = useState({
    affected_unit_type: '',
    affected_unit_id: '',
    disruption_type: '',
    affected_location: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const data = await generateReroutingPlan(formData);
      setReroutingPlan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Dynamic Rerouting</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Affected Unit Type
            </label>
            <select
              name="affected_unit_type"
              value={formData.affected_unit_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition duration-150 ease-in-out"
              required
            >
              <option value="">Select a unit type</option>
              <option value="warehouse">Warehouse</option>
              <option value="retailer">Retailer</option>
              <option value="distributor">Distributor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Affected Unit ID
            </label>
            <input
              type="text"
              name="affected_unit_id"
              value={formData.affected_unit_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition duration-150 ease-in-out"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Disruption Type
            </label>
            <select
              name="disruption_type"
              value={formData.disruption_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition duration-150 ease-in-out"
              required
            >
              <option value="">Select a disruption type</option>
              <option value="natural_disaster">Natural Disaster</option>
              <option value="unavailability">Unavailability</option>
              <option value="technical_issue">Technical Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Affected Location
            </label>
            <input
              type="text"
              name="affected_location"
              value={formData.affected_location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:border-transparent transition duration-150 ease-in-out"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 
                     dark:bg-blue-500 dark:hover:bg-blue-600
                     text-white font-medium shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                     focus:ring-offset-2 dark:focus:ring-offset-gray-800
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition duration-150 ease-in-out"
            disabled={loading}
          >
            {loading ? 'Generating Plan...' : 'Generate Rerouting Plan'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {reroutingPlan && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              AI-Generated Rerouting Plan
            </h2>
            <pre className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 
                          border border-gray-200 dark:border-gray-600
                          overflow-auto text-sm text-gray-800 dark:text-gray-200">
              {JSON.stringify(reroutingPlan, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicRerouting; 