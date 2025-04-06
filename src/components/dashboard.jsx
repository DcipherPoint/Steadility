import React, { useState, useEffect } from 'react';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-neutral-dark shadow-soft hover:shadow-lg transition-all duration-200"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        // Sun icon for light mode
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg className="w-6 h-6 text-neutral-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      )}
    </button>
  );
};

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has dark mode preference saved
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const metrics = [
    {
      title: 'Carbon Footprint',
      value: '2.5M',
      unit: 'tons CO2',
      change: '+12%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Efficiency Rate',
      value: '94%',
      change: '+5%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Active Routes',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark transition-colors duration-200">
      <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-primary dark:text-primary-light mb-2">Dashboard Overview</h1>
          <p className="text-neutral-dark/70 dark:text-neutral-light/70">
            Monitor your sustainable logistics performance
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="card dark:bg-neutral-dark/50 dark:text-neutral-light group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 dark:bg-primary-light/10 rounded-lg text-primary dark:text-primary-light">
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-neutral-dark/70 dark:text-neutral-light/70 mb-2">{metric.title}</h3>
              <p className="text-2xl font-display text-primary dark:text-primary-light">
                {metric.value}
                {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card dark:bg-neutral-dark/50 dark:text-neutral-light">
            <h3 className="text-primary dark:text-primary-light mb-4">Route Optimization</h3>
            <p className="mb-4">Optimize your delivery routes for maximum efficiency and minimal environmental impact.</p>
            <button className="btn-secondary">Optimize Routes</button>
          </div>
          <div className="card dark:bg-neutral-dark/50 dark:text-neutral-light">
            <h3 className="text-primary dark:text-primary-light mb-4">Sustainability Report</h3>
            <p className="mb-4">Generate detailed reports on your environmental impact and sustainability metrics.</p>
            <button className="btn-secondary">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 