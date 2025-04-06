import React, { useState } from 'react';
import { Card, Badge, Button, Table, Progress, Switch, ProgressBar, Title, Text, Grid, Col } from '@tremor/react';
import {
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AIInventoryTransfers = () => {
  const [riskAlertsEnabled, setRiskAlertsEnabled] = useState(true);

  // Mock data - replace with actual data from your backend
  const warehouses = [
    {
      id: 1,
      name: 'Warehouse A',
      location: 'New York',
      stock: 1500,
      capacity: 2000,
      risk: 'Low',
      transfers: [
        { to: 'Warehouse B', amount: 200, status: 'Pending' },
        { to: 'Warehouse C', amount: 150, status: 'Completed' }
      ]
    },
    {
      id: 2,
      name: 'Warehouse B',
      location: 'Los Angeles',
      stock: 800,
      capacity: 1500,
      risk: 'High',
      transfers: [
        { to: 'Warehouse A', amount: 300, status: 'In Progress' }
      ]
    },
    {
      id: 3,
      name: 'Warehouse C',
      location: 'Chicago',
      stock: 1200,
      capacity: 1800,
      risk: 'Medium',
      transfers: [
        { to: 'Warehouse A', amount: 100, status: 'Completed' }
      ]
    }
  ];

  const aiSuggestions = [
    {
      id: 1,
      from: 'Warehouse A',
      to: 'Warehouse B',
      amount: 200,
      reason: 'Low stock alert',
      impact: 'High',
      confidence: 92
    },
    {
      id: 2,
      from: 'Warehouse C',
      to: 'Warehouse A',
      amount: 150,
      reason: 'Demand forecast',
      impact: 'Medium',
      confidence: 85
    }
  ];

  const riskFactors = [
    {
      id: 1,
      warehouse: 'Warehouse B',
      factor: 'Weather Risk',
      severity: 'High',
      impact: 'Potential delay in deliveries'
    },
    {
      id: 2,
      warehouse: 'Warehouse C',
      factor: 'Traffic Congestion',
      severity: 'Medium',
      impact: 'Slight delay in transfers'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Inventory Transfers</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={riskAlertsEnabled}
              onChange={setRiskAlertsEnabled}
            />
            <span className="text-sm">Risk Alerts</span>
          </div>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Overview */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Warehouse Overview</h2>
          </div>
          <div className="space-y-4">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{warehouse.name}</h3>
                  <Badge color={warehouse.risk === 'High' ? 'red' : warehouse.risk === 'Medium' ? 'yellow' : 'green'}>
                    {warehouse.risk} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span>{warehouse.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock Level</span>
                    <span>{warehouse.stock} / {warehouse.capacity}</span>
                  </div>
                  <ProgressBar value={(warehouse.stock / warehouse.capacity) * 100} color="blue" />
                </div>
                {warehouse.transfers.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Active Transfers</h4>
                    {warehouse.transfers.map((transfer, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{transfer.to}</span>
                        <div className="flex items-center space-x-2">
                          <span>{transfer.amount} units</span>
                          <Badge color={transfer.status === 'Completed' ? 'green' : transfer.status === 'In Progress' ? 'blue' : 'yellow'}>
                            {transfer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* AI Transfer Suggestions */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ArrowsRightLeftIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">AI Transfer Suggestions</h2>
          </div>
          <div className="space-y-4">
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{suggestion.from} → {suggestion.to}</h3>
                  <Badge color={suggestion.impact === 'High' ? 'red' : 'yellow'}>
                    {suggestion.impact} Impact
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span>{suggestion.amount} units</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">AI Confidence</span>
                    <span>{suggestion.confidence}%</span>
                  </div>
                  <ProgressBar value={suggestion.confidence} color="green" />
                </div>
                <div className="mt-3 flex space-x-2">
                  <Button size="sm" variant="secondary" className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Factors */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Risk Factors</h2>
          </div>
          <div className="space-y-4">
            {riskFactors.map((risk) => (
              <div key={risk.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{risk.warehouse}</h3>
                  <Badge color={risk.severity === 'High' ? 'red' : 'yellow'}>
                    {risk.severity}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Factor</span>
                    <span>{risk.factor}</span>
                  </div>
                  <p className="text-sm text-gray-600">{risk.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transfer Analytics */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Transfer Analytics</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Transfers</h3>
                <p className="text-2xl font-bold text-blue-600">450</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">AI Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">92%</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Transfer Efficiency</Text>
                <Text>85%</Text>
              </div>
              <ProgressBar value={85} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Cost Reduction</Text>
                <Text>15%</Text>
              </div>
              <ProgressBar value={15} color="green" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Risk Assessment</Text>
                <Text>92%</Text>
              </div>
              <ProgressBar value={92} color="green" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIInventoryTransfers; 