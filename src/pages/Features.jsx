import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import {
  BeakerIcon,
  CloudArrowUpIcon,
  CogIcon,
  ChartBarIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Features = () => {
  const features = [
    {
      title: 'AI-Powered Inventory Management',
      description: [
        'Demand Forecasting with ML-powered predictions',
        'Dynamic Docking for automated stock balancing',
        'Real-time monitoring and optimization',
        'Smart alerts and restock recommendations'
      ],
      icon: BeakerIcon,
      color: 'text-blue-400'
    },
    {
      title: 'Data Source Integration',
      description: [
        'One-click integration with major ERP systems',
        'Automated data mapping and processing',
        'Real-time synchronization',
        'Historical data analysis'
      ],
      icon: CloudArrowUpIcon,
      color: 'text-green-400'
    },
    {
      title: 'Dynamic Rerouting',
      description: [
        'AI-assisted plan generation',
        'Natural disaster handling',
        'Technical issue management',
        'Real-time route adjustments'
      ],
      icon: TruckIcon,
      color: 'text-purple-400'
    }
  ];

  const metrics = [
    { label: 'Route Efficiency', value: '35-40%' },
    { label: 'Carbon Footprint', value: '30-35%' },
    { label: 'Processing Time', value: '<2s' }
  ];

  return (
    <div className="min-h-screen bg-[#121212] font-roboto">
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-blue-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob opacity-70" />
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob animation-delay-2000 opacity-70" />
        <div className="absolute -bottom-1/4 left-1/3 w-[800px] h-[800px] bg-indigo-600/40 rounded-full mix-blend-normal filter blur-[80px] animate-blob animation-delay-4000 opacity-70" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/0 via-[#121212]/20 to-[#121212] z-10" />
      </div>

      {/* Content with relative positioning */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="mb-8 py-4">
            <h1 className="text-4xl md:text-5xl font-bold font-montserrat bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 leading-[1.4] md:leading-[1.4] tracking-normal">
              Next-Generation Logistics Management
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Empowering logistics operations with AI-driven optimization and intelligent inventory management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
              <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
              <ul className="space-y-2">
                {feature.description.map((item, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-16"
        >
          <h2 className="text-2xl font-semibold mb-6 text-white">Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {metric.value}
                </div>
                <div className="text-gray-300">{metric.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors duration-300"
          >
            Start Optimizing Now
            <TruckIcon className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
