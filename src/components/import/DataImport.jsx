import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useImport } from '../../contexts/ImportContext';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Container
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  CloudDownload as FetchIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: '16px 24px',
  maxWidth: '100%',
  background: 'transparent',
  minHeight: '100vh',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1F2E',
}));

const PageHeader = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#1A1F2E',
  marginBottom: '4px',
  letterSpacing: '-0.5px',
}));

const PageDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.813rem',
  fontFamily: 'Montserrat, sans-serif',
  color: theme.palette.mode === 'dark' ? '#CBD5E1' : 'rgba(26, 31, 46, 0.7)',
  marginBottom: '24px',
  letterSpacing: '0.15px',
  lineHeight: 1.5,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#111827' : '#ffffff',
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 10px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
    : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 'unset',
  marginBottom: '24px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#3B82F6',
    height: '2px',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  minWidth: '120px',
  padding: '12px 24px',
  color: theme.palette.mode === 'dark' ? '#CBD5E1' : '#1A1F2E',
  minHeight: 'unset',
  '&.Mui-selected': {
    color: '#3B82F6',
    fontWeight: 600,
  },
}));

const ErrorMessage = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`,
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: theme.palette.mode === 'dark' ? '#94A3B8' : '#1A1F2E',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.875rem',
}));

const FetchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3B82F6',
  color: '#FFFFFF',
  fontFamily: 'Montserrat, sans-serif',
  textTransform: 'none',
  padding: '8px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#2563EB',
  },
  '&.Mui-disabled': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
    color: theme.palette.mode === 'dark' ? '#E2E8F0' : 'rgba(26, 31, 46, 0.7)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  textTransform: 'none',
  borderColor: theme.palette.mode === 'dark' ? '#94A3B8' : '#1A1F2E',
  color: theme.palette.mode === 'dark' ? '#94A3B8' : '#1A1F2E',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
    backgroundColor: 'transparent',
  },
  '&.Mui-disabled': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(26, 31, 46, 0.3)',
    color: theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(26, 31, 46, 0.3)',
  },
}));

const NoDataText = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#E2E8F0' : '#1A1F2E',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.875rem',
  textAlign: 'center',
  marginTop: '48px',
}));

const FileSelectionTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#E2E8F0' : '#1A1F2E',
  fontFamily: 'Montserrat, sans-serif',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
    color: theme.palette.mode === 'dark' ? '#E2E8F0' : 'rgba(0, 0, 0, 0.87)',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.875rem',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#FFFFFF' : 'rgba(0, 0, 0, 0.9)',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
  },
}));

const TotalRecordsText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.75rem',
  color: theme.palette.mode === 'dark' ? '#CBD5E1' : 'rgba(0, 0, 0, 0.7)',
}));

// Add TabPanel component definition
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DataImport = () => {
  const { user } = useAuth();
  const { 
    importedData, 
    totalRecords,
    loading,
    error,
    csvFile,
    hasImportedCSV,
    dataChecked,
    lastUpdated,
    importData,
    saveData,
    handleFileChange: handleContextFileChange,
    refreshData,
    clearError
  } = useImport();
  const [tabValue, setTabValue] = useState(0);

  const handleImport = async (source) => {
    importData(source);
  };

  const handleRefresh = async (source) => {
    refreshData(source);
  };

  const handleSave = async (source) => {
    saveData(source);
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      handleContextFileChange(event.target.files[0]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderDataTable = (source) => {
    const data = importedData[source];
    
    if (!dataChecked[source]) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={28} sx={{ color: theme => theme.palette.primary.main }} />
        </Box>
      );
    }
    
    if (data.length === 0) {
      return (
        <Box p={3} textAlign="center">
          <NoDataText>
            No {source.toUpperCase()} data imported yet. Use the "Fetch New Data" button to import data.
          </NoDataText>
        </Box>
      );
    }
    
    return (
      <StyledCard>
        <CardContent>
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Location ID</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Company ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.data?.product || '-'}</TableCell>
                    <TableCell>{row.data?.location || '-'}</TableCell>
                    <TableCell>{row.data?.quantity || '-'}</TableCell>
                    <TableCell>{row.data?.type || '-'}</TableCell>
                    <TableCell>{row.company_id || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
          <Box sx={{ mt: 2 }}>
            <TotalRecordsText>
              {source !== 'csv' && totalRecords[source] > data.length
                ? `* Displaying ${data.length} records out of ${totalRecords[source]} total records` 
                : `Total: ${data.length} records`}
            </TotalRecordsText>
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  const renderActionButtons = (source) => {
    if (loading && !dataChecked[source]) return <CircularProgress size={24} />;
    
    return (
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <FetchButton
          variant="contained"
          onClick={() => handleImport(source)}
          startIcon={<FetchIcon />}
          disabled={loading}
        >
          FETCH NEW DATA
        </FetchButton>
        {importedData[source].length > 0 && (
          <>
            <OutlinedButton
              variant="outlined"
              onClick={() => handleRefresh(source)}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              REFRESH FROM DATABASE
            </OutlinedButton>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleSave(source)}
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              SAVE TO DATABASE
            </Button>
          </>
        )}
      </Box>
    );
  };

  const renderCsvActionButtons = () => {
    if (loading && !dataChecked.csv) return <CircularProgress size={24} />;
    
    return (
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 2
      }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-file-input">
          <Button
            variant="contained"
            component="span"
            startIcon={<AddIcon />}
            disabled={loading}
          >
            {hasImportedCSV ? 'ADD CSV FILE' : 'SELECT CSV FILE'}
          </Button>
        </label>
        {csvFile && (
          <>
            <FileSelectionTypography variant="body2">
              Selected file: {csvFile.name}
            </FileSelectionTypography>
            <Button
              variant="contained"
              onClick={() => handleImport('csv')}
              disabled={loading}
            >
              IMPORT CSV
            </Button>
          </>
        )}
        {importedData.csv.length > 0 && (
          <Button
            variant="contained"
            color="success"
            onClick={() => handleSave('csv')}
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            SAVE TO DATABASE
          </Button>
        )}
      </Box>
    );
  };

  return (
    <StyledContainer>
      <PageHeader variant="h1">Import Data</PageHeader>
      <PageDescription>
        AI-powered data integration for your supply chain management
      </PageDescription>

      {lastUpdated && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Typography variant="caption" sx={{ color: theme => theme.palette.mode === 'dark' ? '#94A3B8' : '#475569' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
      )}

      <StyledTabs 
        value={tabValue} 
        onChange={handleTabChange}
      >
        <StyledTab label="ODOO" />
        <StyledTab label="ZOHO" />
        <StyledTab label="CSV" />
      </StyledTabs>

      {error && (
        <ErrorMessage>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" 
              fill="currentColor"/>
          </svg>
          {error}
          <Box 
            sx={{ marginLeft: 'auto', cursor: 'pointer' }} 
            onClick={clearError}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15.8333 5.34166L14.6583 4.16666L10 8.82499L5.34167 4.16666L4.16667 5.34166L8.82501 9.99999L4.16667 14.6583L5.34167 15.8333L10 11.175L14.6583 15.8333L15.8333 14.6583L11.175 9.99999L15.8333 5.34166Z" 
                fill="currentColor"/>
            </svg>
          </Box>
        </ErrorMessage>
      )}

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, px: 3 }}>
          {renderActionButtons('odoo')}
        </Box>
        {loading && !dataChecked.odoo ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} sx={{ color: theme => theme.palette.primary.main }} />
          </Box>
        ) : renderDataTable('odoo')}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, px: 3 }}>
          {renderActionButtons('zoho')}
        </Box>
        {loading && !dataChecked.zoho ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} sx={{ color: theme => theme.palette.primary.main }} />
          </Box>
        ) : renderDataTable('zoho')}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3, px: 3 }}>
          {renderCsvActionButtons()}
        </Box>
        {loading && !dataChecked.csv ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={28} sx={{ color: theme => theme.palette.primary.main }} />
          </Box>
        ) : renderDataTable('csv')}
      </TabPanel>
    </StyledContainer>
  );
};

export default DataImport; 