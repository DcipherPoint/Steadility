import React from 'react';
import { Card, Badge, Button, Table, Progress, BarChart, ProgressBar, Title, Text, Grid, Col } from '@tremor/react';
import {
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AIDecisionAnalysis = () => {
  // Mock data - replace with actual data from your backend
  const decisionMetrics = [
    {
      id: 1,
      category: 'Route Optimization',
      decisions: 45,
      impact: 85,
      savings: '$12,500',
      confidence: 92
    },
    {
      id: 2,
      category: 'Inventory Management',
      decisions: 32,
      impact: 78,
      savings: '$8,200',
      confidence: 88
    },
    {
      id: 3,
      category: 'Demand Forecasting',
      decisions: 28,
      impact: 82,
      savings: '$5,800',
      confidence: 90
    },
    {
      id: 4,
      category: 'Risk Mitigation',
      decisions: 15,
      impact: 75,
      savings: '$3,200',
      confidence: 85
    }
  ];

  const performanceData = [
    { month: 'Jan', fuel: 1200, co2: 2.5, time: 45 },
    { month: 'Feb', fuel: 1150, co2: 2.3, time: 42 },
    { month: 'Mar', fuel: 1100, co2: 2.2, time: 40 },
    { month: 'Apr', fuel: 1050, co2: 2.1, time: 38 },
    { month: 'May', fuel: 1000, co2: 2.0, time: 35 }
  ];

  const recentDecisions = [
    {
      id: 1,
      type: 'Route Optimization',
      description: 'AI suggested alternative route to avoid traffic congestion',
      impact: 'Positive',
      savings: '$500',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'Inventory Transfer',
      description: 'Automated stock transfer between warehouses',
      impact: 'Positive',
      savings: '$300',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      type: 'Demand Forecast',
      description: 'Updated inventory levels based on predicted demand',
      impact: 'Positive',
      savings: '$200',
      timestamp: '6 hours ago'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Decision Analysis</h1>
        <div className="flex items-center space-x-4">
          <Badge color="blue">Active</Badge>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decision Impact Overview */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Decision Impact Overview</h2>
          </div>
          <div className="space-y-4">
            {decisionMetrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric.category}</span>
                  <Badge color="blue">{metric.decisions} decisions</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <ProgressBar value={metric.impact} color="blue" className="flex-1" />
                  <span className="text-sm font-medium">{metric.impact}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Confidence: {metric.confidence}%</span>
                  <span className="text-green-600 font-medium">Saved: {metric.savings}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Trends */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">Performance Trends</h2>
          </div>
          <div className="space-y-4">
            <BarChart
              data={performanceData}
              index="month"
              categories={['fuel', 'co2', 'time']}
              colors={['blue', 'green', 'purple']}
              className="h-72"
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fuel Saved</h3>
                    <p className="text-lg font-bold text-blue-600">200L</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">CO2 Reduced</h3>
                    <p className="text-lg font-bold text-green-600">0.5 tons</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-purple-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Time Saved</h3>
                    <p className="text-lg font-bold text-purple-600">10h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Decisions */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Recent Decisions</h2>
          </div>
          <div className="space-y-4">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{decision.type}</h3>
                  <Badge color="green">{decision.impact}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{decision.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{decision.timestamp}</span>
                  <span className="text-green-600 font-medium">Saved: {decision.savings}</span>
                </div>
              </div>
            ))}
            <Button size="sm" variant="secondary" className="w-full">
              View All Decisions
            </Button>
          </div>
        </Card>

        {/* AI Confidence Analysis */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">AI Confidence Analysis</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Overall Accuracy</h3>
                <p className="text-2xl font-bold text-blue-600">92%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Decision Speed</h3>
                <p className="text-2xl font-bold text-green-600">0.3s</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Route Optimization</Text>
                <Text>95%</Text>
              </div>
              <ProgressBar value={95} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Inventory Management</Text>
                <Text>88%</Text>
              </div>
              <ProgressBar value={88} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Demand Forecasting</Text>
                <Text>90%</Text>
              </div>
              <ProgressBar value={90} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>AI Confidence</Text>
                <Text>85%</Text>
              </div>
              <ProgressBar value={85} color="green" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIDecisionAnalysis; 