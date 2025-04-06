import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Logo = ({ className = '', size = 'medium', variant = 'dashboard' }) => {
  const { isDarkMode } = useTheme();
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-12'
  };

  const variantClasses = {
    landing: 'text-white',
    dashboard: 'text-gray-900 dark:text-white'
  };

  return (
    <Link 
      to="/" 
      className={`flex items-center logo-container ${className}`}
    >
      <img 
        src={isDarkMode ? '/images/steadility-logo-dark.png' : '/images/steadility-logo-light.png'}
        alt="Steadility" 
        className={`${sizeClasses[size]} w-auto object-contain scale-[1.75] transform-gpu`}
      />
    </Link>
  );
};

export default Logo; 