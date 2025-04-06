import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Define MUI themes based on our light/dark mode
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    // Add any specific light theme overrides here if needed
    background: {
      default: '#f9fafb', // Corresponds to bg-gray-50
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Corresponds to dark text
      secondary: '#6b7280', // Corresponds to gray text
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // Add any specific dark theme overrides here if needed
    background: {
      default: '#1f2937', // Example dark background (adjust if needed)
      paper: '#374151',    // Example dark paper background
    },
    text: {
      primary: '#f9fafb', // Corresponds to light text
      secondary: '#d1d5db', // Corresponds to lighter gray text
    },
  },
});

const Layout = ({ children }) => {
  // Changed variable name to avoid conflict with MUI ThemeProvider
  const { isDarkMode, toggleDarkMode } = useTheme();
  const activeTheme = isDarkMode ? darkTheme : lightTheme;

  return (
    // Apply the correct MUI theme and baseline styles
    <MuiThemeProvider theme={activeTheme}>
      <CssBaseline />
      {/* Use a div with Tailwind classes for overall background controlled by ThemeContext */}
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-neutral-dark text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <main className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-800/30 transition-all duration-200"
                  aria-label="Toggle Dark Mode"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              </div>
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default Layout;