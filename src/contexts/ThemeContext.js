import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Function to determine initial dark mode state before component renders
const getInitialDarkMode = () => {
  const storedDarkMode = localStorage.getItem('darkMode');
  if (storedDarkMode !== null) {
    return storedDarkMode === 'true';
  }
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  localStorage.setItem('darkMode', String(prefersDarkMode)); 
  return prefersDarkMode;
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  // Effect to apply class initially and listen for changes
  useEffect(() => {
    // Apply the class based on the *initial* state on mount
    applyDarkMode(isDarkMode);

    // Listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Logic to sync with system preference if no manual toggle occurred
      const currentStoredValue = localStorage.getItem('darkMode');
      const recalculateInitialValue = (() => { 
          const initialStored = localStorage.getItem('darkMode');
          if(initialStored !== null) return initialStored === 'true';
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
      })();

      if (currentStoredValue === String(recalculateInitialValue)) {
          const newSystemPref = e.matches;
          setIsDarkMode(newSystemPref); 
          localStorage.setItem('darkMode', String(newSystemPref));
          applyDarkMode(newSystemPref);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);

    // Run this effect whenever isDarkMode changes to ensure class is updated
    // And also run once on mount to apply initial class
  }, [isDarkMode]); 

  // Function to apply dark mode class to DOM elements
  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    // Explicitly store user's choice, overriding any previous system/initial value
    localStorage.setItem('darkMode', String(newDarkMode)); 
    applyDarkMode(newDarkMode); // Apply class immediately
    
    // Dispatch custom event (optional)
    window.dispatchEvent(new CustomEvent('themechange', { detail: { isDarkMode: newDarkMode } }));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
