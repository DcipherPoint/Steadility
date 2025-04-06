import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DynamicRerouting from '../../pages/DynamicRerouting';

/**
 * This wrapper component ensures proper loading of the Dynamic Rerouting page 
 * by preventing redirection issues from the nested authentication check
 */
const DynamicReroutingWrapper = () => {
  const { user } = useAuth();
  
  return (
    <>
      {user && <DynamicRerouting />}
    </>
  );
};

export default DynamicReroutingWrapper; 