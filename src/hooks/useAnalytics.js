import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [carbonCredits, setCarbonCredits] = useState(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch carbon credits data
  const fetchCarbonCredits = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCarbonCredits();
      setCarbonCredits(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching carbon credits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch environmental impact data
  const fetchEnvironmentalImpact = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getEnvironmentalImpact();
      setEnvironmentalImpact(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching environmental impact:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async (timeframe = '6months') => {
    try {
      setLoading(true);
      const data = await analyticsService.getHistoricalData(timeframe);
      setHistoricalData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate sustainability report
  const generateReport = async (params) => {
    try {
      setLoading(true);
      const result = await analyticsService.generateReport(params);
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all analytics data
  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchCarbonCredits(),
        fetchEnvironmentalImpact(),
        fetchHistoricalData(),
      ]);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return {
    metrics,
    carbonCredits,
    environmentalImpact,
    historicalData,
    loading,
    error,
    fetchMetrics,
    fetchCarbonCredits,
    fetchEnvironmentalImpact,
    fetchHistoricalData,
    generateReport,
    fetchAllAnalytics,
  };
}; 