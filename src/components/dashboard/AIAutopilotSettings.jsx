import React, { useState } from 'react';
import { Card, Button, Badge, Switch, NumberInput, Title, Text, Grid, Col } from '@tremor/react';
import {
  SparklesIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const AIAutopilotSettings = () => {
  const [autonomyLevel, setAutonomyLevel] = useState('full');
  const [confidenceThreshold, setConfidenceThreshold] = useState(60);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    dashboard: true,
    slack: false
  });

  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Autopilot Settings</h1>
        <Badge color="blue">Active</Badge>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autonomy Level Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Autonomy Level</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Text>Autonomy Level</Text>
              <NumberInput
                value={autonomyLevel}
                onValueChange={setAutonomyLevel}
                min={0}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
            <div>
              <Text>Confidence Threshold</Text>
              <NumberInput
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div className="pt-4">
              <Button size="sm" variant="secondary" className="w-full">
                Save Autonomy Settings
              </Button>
            </div>
          </div>
        </Card>

        {/* Risk Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BellIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Risk Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive risk alerts via email</p>
              </div>
              <Switch
                checked={notifications.email}
                onChange={() => handleNotificationToggle('email')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-500">Get instant SMS alerts</p>
              </div>
              <Switch
                checked={notifications.sms}
                onChange={() => handleNotificationToggle('sms')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dashboard Alerts</h3>
                <p className="text-sm text-gray-500">Show alerts in dashboard</p>
              </div>
              <Switch
                checked={notifications.dashboard}
                onChange={() => handleNotificationToggle('dashboard')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Slack Integration</h3>
                <p className="text-sm text-gray-500">Send alerts to Slack channel</p>
              </div>
              <Switch
                checked={notifications.slack}
                onChange={() => handleNotificationToggle('slack')}
              />
            </div>
            <div className="pt-4">
              <Button size="sm" variant="secondary" className="w-full">
                Save Notification Settings
              </Button>
            </div>
          </div>
        </Card>

        {/* AI Performance Metrics */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">AI Performance</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Decision Accuracy</h3>
                <p className="text-2xl font-bold text-green-600">92%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
                <p className="text-2xl font-bold text-blue-600">0.3s</p>
              </div>
            </div>
            <div className="pt-4">
              <Button size="sm" variant="secondary" className="w-full">
                View Detailed Metrics
              </Button>
            </div>
          </div>
        </Card>

        {/* Safety Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Safety Controls</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Emergency Override</h3>
                <p className="text-sm text-gray-500">Allow manual override in emergencies</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Risk Assessment</h3>
                <p className="text-sm text-gray-500">Enable real-time risk assessment</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-4">
              <Button size="sm" variant="secondary" className="w-full">
                Save Safety Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIAutopilotSettings; 