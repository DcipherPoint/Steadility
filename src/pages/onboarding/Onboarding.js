import React from 'react';
import { Link } from 'react-router-dom';
import { TruckIcon, ChartBarIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'AI-Powered Route Optimization',
    description: 'Optimize your logistics routes with advanced AI algorithms for maximum efficiency.',
    icon: TruckIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Get detailed insights into your operations with comprehensive analytics and reporting.',
    icon: ChartBarIcon,
  },
  {
    name: 'Sustainability Focus',
    description: 'Reduce your carbon footprint with eco-friendly route planning and optimization.',
    icon: GlobeAltIcon,
  },
];

const Onboarding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block text-primary-600">Sustainable Logistics</span>
            <span className="block text-secondary-600">Optimization Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Revolutionize your logistics management with AI-powered solutions and sustainability-focused features.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute -top-4 left-6">
                    <div className="bg-primary-500 rounded-full p-3">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:text-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Onboarding; 