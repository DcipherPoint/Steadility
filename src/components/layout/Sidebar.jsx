import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BeakerIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'AI Autopilot', href: '/dashboard/ai-autopilot', icon: CogIcon },
  { name: 'Risk Radar', href: '/dashboard/risk-radar', icon: ShieldCheckIcon },
  { name: 'AI Data Cleaning', href: '/dashboard/ai-data-cleaning', icon: ArrowPathIcon },
  { name: 'Team Performance', href: '/dashboard/team-performance', icon: UserGroupIcon },
  { name: 'AI Decision Analysis', href: '/dashboard/ai-decision-analysis', icon: BeakerIcon },
  { name: 'AI Inventory Transfers', href: '/dashboard/ai-inventory-transfers', icon: TruckIcon },
  { name: 'Sustainability Hub', href: '/dashboard/sustainability-hub', icon: ChartBarIcon },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-full bg-gray-800 rounded-r-2xl">
          <div className="flex-1 flex flex-col pt-5 pb-6 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <span className="text-white text-xl font-bold">AI Dashboard</span>
            </div>
            <nav className="mt-5 flex-1 px-3 space-y-2 mb-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 