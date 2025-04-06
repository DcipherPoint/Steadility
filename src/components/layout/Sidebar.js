import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CubeIcon,
  ArrowUpTrayIcon,
  CogIcon,
  ChartBarIcon,
  ArrowPathIcon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Inventory', href: '/dashboard/inventory', icon: CubeIcon },
  { name: 'Import Data', href: '/dashboard/import', icon: ArrowUpTrayIcon },
];

const aiFeatures = [
  { name: 'Inventory Optimization', href: '/dashboard/inventory-optimization', icon: ChartBarIcon },
  { name: 'Dynamic Rerouting', href: '/dashboard/dynamic-rerouting', icon: ArrowPathIcon },
  { name: 'Last Mile Delivery', href: '/dashboard/last-mile-delivery', icon: TruckIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const renderNavItems = (items) => (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-1 transition-all duration-200 ease-in-out
              ${isActive
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-dark/50'
              }
            `}
          >
            <item.icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors duration-200 ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`} />
            {!collapsed && item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-neutral-dark border-r dark:border-gray-800 flex flex-col transition-all duration-300 relative`}>
      {/* Logo Section */}
      <div className="border-b dark:border-gray-800">
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-center'} py-8`}>
          {!collapsed && <Logo size="small" />}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-6'} mt-6 overflow-y-auto`}>
        {renderNavItems(navigation)}
        
        {/* AI Features Section */}
        <div className="mt-8">
          {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              AI & Optimization
            </h3>
          )}
          <div className="mt-3">
            {renderNavItems(aiFeatures)}
          </div>
        </div>
      </nav>

      {/* Bottom section with Settings and logout */}
      <div className={`border-t dark:border-gray-800 ${collapsed ? 'px-2' : 'px-6'} py-4`}>
        {/* Settings link */}
        <Link
          to="/dashboard/settings"
          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-3 transition-all duration-200 ease-in-out
            ${location.pathname === '/dashboard/settings'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-dark/50'
            }
          `}
        >
          <CogIcon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors duration-200 ${
            location.pathname === '/dashboard/settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
          }`} />
          {!collapsed && 'Settings'}
        </Link>

        {/* Logout button */}
        <button
          onClick={confirmLogout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg mb-3 transition-all duration-200 ease-in-out text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
        >
          <ArrowRightOnRectangleIcon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 text-red-600 dark:text-red-400`} />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {/* Collapse/Expand button positioned on side border */}
      <button
        onClick={toggleSidebar}
        className={`absolute -right-4 bottom-24 h-10 w-8 bg-white dark:bg-neutral-dark border border-gray-200 dark:border-gray-700 shadow-sm rounded-r-md flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? 
          <ChevronRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" /> : 
          <ChevronLeftIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        }
      </button>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl bg-white dark:bg-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 