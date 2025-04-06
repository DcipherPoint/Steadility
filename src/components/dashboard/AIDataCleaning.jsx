import React, { useState } from 'react';
import {
  Card,
  Badge,
  Button,
  ProgressBar,
  Select,
  SelectItem,
  Title,
  Text,
  Grid,
  Col,
} from '@tremor/react';
import {
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const AIDataCleaning = () => {
  const [selectedDataset, setSelectedDataset] = useState('inventory');
  const [cleaningStatus, setCleaningStatus] = useState('idle');

  // Mock data - replace with actual data from your backend
  const datasets = [
    {
      id: 'inventory',
      name: 'Inventory Data',
      records: 15000,
      issues: 45,
      confidence: 92
    },
    {
      id: 'routes',
      name: 'Route Data',
      records: 8500,
      issues: 28,
      confidence: 95
    },
    {
      id: 'demand',
      name: 'Demand Forecast',
      records: 12000,
      issues: 32,
      confidence: 88
    }
  ];

  const dataIssues = [
    {
      id: 1,
      type: 'Missing Values',
      count: 15,
      severity: 'High',
      affected: 'Product IDs',
      suggestion: 'Use historical data to fill missing values'
    },
    {
      id: 2,
      type: 'Format Inconsistency',
      count: 8,
      severity: 'Medium',
      affected: 'Date formats',
      suggestion: 'Standardize to ISO format'
    },
    {
      id: 3,
      type: 'Outliers',
      count: 22,
      severity: 'Low',
      affected: 'Quantity values',
      suggestion: 'Apply statistical threshold'
    }
  ];

  const cleaningHistory = [
    {
      id: 1,
      date: '2024-03-13',
      dataset: 'Inventory Data',
      records: 15000,
      issues: 45,
      status: 'Completed',
      confidence: 92
    },
    {
      id: 2,
      date: '2024-03-12',
      dataset: 'Route Data',
      records: 8500,
      issues: 28,
      status: 'Completed',
      confidence: 95
    },
    {
      id: 3,
      date: '2024-03-11',
      dataset: 'Demand Forecast',
      records: 12000,
      issues: 32,
      status: 'Completed',
      confidence: 88
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Data Cleaning</h1>
        <div className="flex items-center space-x-4">
          <Badge color="blue">Active</Badge>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dataset Selection */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DocumentCheckIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Dataset Selection</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dataset
              </label>
              <Select
                value={selectedDataset}
                onValueChange={setSelectedDataset}
                className="w-full"
              >
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {datasets.find(d => d.id === selectedDataset)?.records.toLocaleString()}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Data Quality</h3>
                <p className="text-2xl font-bold text-green-600">
                  {datasets.find(d => d.id === selectedDataset)?.confidence}%
                </p>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="w-full">
              Start Cleaning Process
            </Button>
          </div>
        </Card>

        {/* Data Issues */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Data Issues</h2>
          </div>
          <div className="space-y-4">
            {dataIssues.map((issue) => (
              <div key={issue.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{issue.type}</h3>
                  <Badge color={issue.severity === 'High' ? 'red' : issue.severity === 'Medium' ? 'yellow' : 'green'}>
                    {issue.severity}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Count</span>
                    <span>{issue.count} issues</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Affected</span>
                    <span>{issue.affected}</span>
                  </div>
                  <p className="text-sm text-gray-600">{issue.suggestion}</p>
                </div>
                <div className="mt-3">
                  <Button size="sm" variant="secondary" className="w-full">
                    Apply Fix
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cleaning History */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Cleaning History</h2>
          </div>
          <div className="space-y-4">
            {cleaningHistory.map((record) => (
              <div key={record.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{record.dataset}</h3>
                  <Badge color="green">{record.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span>{record.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Records</span>
                    <span>{record.records.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Issues Fixed</span>
                    <span>{record.issues}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Confidence</span>
                    <span>{record.confidence}%</span>
                  </div>
                  <ProgressBar value={record.confidence} color="blue" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cleaning Progress */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ArrowPathIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">Cleaning Progress</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Records Processed</h3>
                <p className="text-2xl font-bold text-blue-600">12,500</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Issues Fixed</h3>
                <p className="text-2xl font-bold text-green-600">38</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Data Quality</Text>
                <Text>92%</Text>
              </div>
              <ProgressBar value={92} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Cleaning Progress</Text>
                <Text>60%</Text>
              </div>
              <ProgressBar value={60} color="green" />
            </div>
            <Button size="sm" variant="secondary" className="w-full">
              View Detailed Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIDataCleaning; 