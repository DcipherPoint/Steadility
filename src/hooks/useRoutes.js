import { useState, useEffect, useCallback } from 'react';
import { routesService } from '../services/routesService';

export const useRoutes = () => {
  const [state, setState] = useState({
    routes: [],
    loading: false,
    error: null
  });

  const handleOperation = useCallback(async (operation, ...args) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await operation(...args);
      setState(prev => ({ 
        ...prev, 
        routes: result.optimizedRoutes || result,
        loading: false 
      }));
      return result;
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  }, []);

  useEffect(() => {
    handleOperation(routesService.getRoutes);
  }, [handleOperation]);

  return {
    ...state,
    fetchRoutes: () => handleOperation(routesService.getRoutes),
    optimizeRoutes: (params) => handleOperation(routesService.optimizeRoutes, params)
  };
};