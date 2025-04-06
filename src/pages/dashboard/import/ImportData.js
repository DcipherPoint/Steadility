import React from 'react';
import { Box } from '@mui/material';
import DataImport from '../../../components/import/DataImport';

const ImportData = () => {
  return (
    <Box 
      sx={{ 
        p: 0,
        minHeight: '100vh',
        background: theme => theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
      }}
    >
      <DataImport />
    </Box>
  );
};

export default ImportData; 