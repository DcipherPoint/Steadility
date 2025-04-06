import React, { useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../assets/images/logo.png';

const Header = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    // Clear session/local storage
    localStorage.removeItem('token');
    sessionStorage.clear();
    // Redirect to login
    navigate('/login');
  };

  return (
    <>
      <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="Logo" className="h-8 w-auto mr-3" />
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-primary-600'}`}>
                Logistics Optimizer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className={`p-2 rounded-full transition-all duration-200 ease-in-out hover:scale-[1.02] ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <BellIcon className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
              <button 
                onClick={handleLogout}
                className={`p-2 rounded-full transition-all duration-200 ease-in-out hover:scale-[1.02] ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <UserCircleIcon className={`h-6 w-6 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Logout
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 