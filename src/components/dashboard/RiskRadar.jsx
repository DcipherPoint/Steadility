import React from 'react';
import { Card, Badge, Button, Table, ProgressBar, AreaChart, Title, Text, Grid, Col } from '@tremor/react';
import {
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const RiskRadar = () => {
  // Mock data - replace with actual data from your backend
  const riskMetrics = [
    { id: 1, category: 'Weather', risk: 75, impact: 'High', trend: 'Increasing' },
    { id: 2, category: 'Traffic', risk: 45, impact: 'Medium', trend: 'Stable' },
    { id: 3, category: 'Supply', risk: 30, impact: 'Low', trend: 'Decreasing' },
    { id: 4, category: 'Demand', risk: 60, impact: 'High', trend: 'Increasing' },
  ];

  const historicalData = [
    { date: '2024-01', predicted: 65, actual: 70 },
    { date: '2024-02', predicted: 68, actual: 65 },
    { date: '2024-03', predicted: 72, actual: 75 },
    { date: '2024-04', predicted: 70, actual: 68 },
    { date: '2024-05', predicted: 75, actual: 72 },
  ];

  const mitigationStrategies = [
    {
      id: 1,
      risk: 'Weather',
      strategy: 'Alternative Route Planning',
      effectiveness: 85,
      status: 'Active'
    },
    {
      id: 2,
      risk: 'Traffic',
      strategy: 'Real-time Traffic Monitoring',
      effectiveness: 75,
      status: 'Active'
    },
    {
      id: 3,
      risk: 'Supply',
      strategy: 'Inventory Buffer',
      effectiveness: 90,
      status: 'Active'
    },
    {
      id: 4,
      risk: 'Demand',
      strategy: 'Dynamic Pricing',
      effectiveness: 80,
      status: 'Active'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Risk Radar</h1>
        <div className="flex items-center space-x-4">
          <Badge color="red">High Risk Alert</Badge>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Overview */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Risk Overview</h2>
          </div>
          <div className="space-y-4">
            {riskMetrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric.category}</span>
                  <Badge color={metric.impact === 'High' ? 'red' : metric.impact === 'Medium' ? 'yellow' : 'green'}>
                    {metric.impact}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <ProgressBar value={metric.risk} color={metric.impact === 'High' ? 'red' : metric.impact === 'Medium' ? 'yellow' : 'green'} className="flex-1" />
                  <span className="text-sm font-medium">{metric.risk}%</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ArrowTrendingUpIcon className={`h-4 w-4 ${metric.trend === 'Increasing' ? 'text-red-500' : metric.trend === 'Decreasing' ? 'text-green-500' : 'text-gray-500'}`} />
                  <span>{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Historical Analysis */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Historical Analysis</h2>
          </div>
          <div className="space-y-4">
            <AreaChart
              data={historicalData}
              index="date"
              categories={['predicted', 'actual']}
              colors={['blue', 'green']}
              className="h-72"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">AI Accuracy</h3>
                <p className="text-2xl font-bold text-blue-600">85%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Risk Reduction</h3>
                <p className="text-2xl font-bold text-green-600">25%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Mitigation Strategies */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Mitigation Strategies</h2>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Risk</th>
                <th>Strategy</th>
                <th>Effectiveness</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mitigationStrategies.map((strategy) => (
                <tr key={strategy.id}>
                  <td>{strategy.risk}</td>
                  <td>{strategy.strategy}</td>
                  <td>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Text>Mitigation Progress</Text>
                        <Text>{strategy.effectiveness}%</Text>
                      </div>
                      <ProgressBar value={strategy.effectiveness} color="green" />
                    </div>
                  </td>
                  <td>
                    <Badge color="green">{strategy.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="pt-4">
            <Button size="sm" variant="secondary" className="w-full">
              View All Strategies
            </Button>
          </div>
        </Card>

        {/* Risk Alerts */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Active Risk Alerts</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-red-700">Severe Weather Alert</h3>
                <Badge color="red">Critical</Badge>
              </div>
              <p className="text-sm text-red-600">Heavy storms expected in Route A. Consider alternative routes.</p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-yellow-700">Traffic Congestion</h3>
                <Badge color="yellow">Medium</Badge>
              </div>
              <p className="text-sm text-yellow-600">Major traffic delays expected in downtown area.</p>
            </div>
            <div className="pt-4">
              <Button size="sm" variant="secondary" className="w-full">
                View All Alerts
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RiskRadar; 