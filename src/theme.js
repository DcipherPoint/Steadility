import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#CBD5E1'
    }
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      color: '#F3F4F6',
    },
    h2: {
      color: '#F3F4F6',
    },
    h3: {
      color: '#F3F4F6',
    },
    h4: {
      color: '#F3F4F6',
    },
    h5: {
      color: '#F3F4F6',
    },
    h6: {
      color: '#F3F4F6',
    },
    body1: {
      color: '#F3F4F6',
    },
    body2: {
      color: '#CBD5E1',
    },
    subtitle1: {
      color: '#F3F4F6',
    },
    subtitle2: {
      color: '#CBD5E1',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        outlinedPrimary: {
          color: '#3B82F6',
          borderColor: '#3B82F6',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: '#3B82F6',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#F3F4F6',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: '#CBD5E1',
          '&.Mui-active': {
            color: '#3B82F6',
          },
        },
      },
    },
    MuiBox: {
      styleOverrides: {
        root: {
          color: '#F3F4F6',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          color: '#F3F4F6',
        },
        indicator: {
          backgroundColor: '#3B82F6',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#CBD5E1',
          '&.Mui-selected': {
            color: '#3B82F6',
          },
        },
      },
    },
  },
});

export default theme; 