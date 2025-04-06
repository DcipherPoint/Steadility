import React from 'react';
import { Card, Badge, Button, Table, ProgressBar, Title, Text, Grid, Col } from '@tremor/react';
import {
  UserGroupIcon,
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const TeamPerformance = () => {
  // Mock data - replace with actual data from your backend
  const teamLeaderboard = [
    {
      id: 1,
      name: 'Team Alpha',
      score: 950,
      badges: 12,
      rank: 1,
      sustainability: 92,
      aiInteractions: 156
    },
    {
      id: 2,
      name: 'Team Beta',
      score: 850,
      badges: 10,
      rank: 2,
      sustainability: 88,
      aiInteractions: 142
    },
    {
      id: 3,
      name: 'Team Gamma',
      score: 750,
      badges: 8,
      rank: 3,
      sustainability: 85,
      aiInteractions: 128
    },
    {
      id: 4,
      name: 'Team Delta',
      score: 650,
      badges: 6,
      rank: 4,
      sustainability: 82,
      aiInteractions: 115
    },
    {
      id: 5,
      name: 'Team Epsilon',
      score: 550,
      badges: 5,
      rank: 5,
      sustainability: 80,
      aiInteractions: 98
    }
  ];

  const individualPerformance = [
    {
      id: 1,
      name: 'John Smith',
      team: 'Team Alpha',
      sustainability: 95,
      aiDecisions: 45,
      aiApproval: 92,
      impact: 'High'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      team: 'Team Beta',
      sustainability: 90,
      aiDecisions: 38,
      aiApproval: 88,
      impact: 'High'
    },
    {
      id: 3,
      name: 'Michael Chen',
      team: 'Team Gamma',
      sustainability: 85,
      aiDecisions: 32,
      aiApproval: 85,
      impact: 'Medium'
    }
  ];

  const sustainabilityBadges = [
    {
      id: 1,
      name: 'Green Champion',
      description: 'Achieved 100% sustainability score',
      icon: '🌱',
      earned: '2024-03-13'
    },
    {
      id: 2,
      name: 'Carbon Warrior',
      description: 'Reduced CO2 emissions by 50%',
      icon: '🌍',
      earned: '2024-03-10'
    },
    {
      id: 3,
      name: 'Eco Innovator',
      description: 'Implemented 5 green initiatives',
      icon: '💡',
      earned: '2024-03-05'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Performance</h1>
        <div className="flex items-center space-x-4">
          <Badge color="blue">Active</Badge>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leaderboard */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Sustainability Leaderboard</h2>
          </div>
          <div className="space-y-4">
            {teamLeaderboard.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">#{team.rank}</span>
                    <h3 className="font-medium">{team.name}</h3>
                  </div>
                  <Badge color="green">{team.badges} badges</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Team Score</Text>
                    <Text>{team.sustainability}%</Text>
                  </div>
                  <ProgressBar value={team.sustainability} color="blue" />
                  <div className="flex justify-between">
                    <Text>AI Interaction</Text>
                    <Text>{team.aiInteractions}</Text>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Individual Performance */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserGroupIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Individual Performance</h2>
          </div>
          <div className="space-y-4">
            {individualPerformance.map((person) => (
              <div key={person.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{person.name}</h3>
                    <p className="text-sm text-gray-500">{person.team}</p>
                  </div>
                  <Badge color={person.impact === 'High' ? 'green' : 'yellow'}>
                    {person.impact} Impact
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Performance</Text>
                    <Text>{person.sustainability}%</Text>
                  </div>
                  <ProgressBar value={person.sustainability} color="green" />
                  <div className="flex justify-between">
                    <Text>AI Interaction</Text>
                    <Text>{person.aiDecisions}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>AI Approval Rate</Text>
                    <Text>{person.aiApproval}%</Text>
                  </div>
                  <ProgressBar value={person.aiApproval} color="blue" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sustainability Badges */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Sustainability Badges</h2>
          </div>
          <div className="space-y-4">
            {sustainabilityBadges.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h3 className="font-medium">{badge.name}</h3>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                    <p className="text-xs text-gray-400">Earned: {badge.earned}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Performance Insights */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">AI Performance Insights</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Total AI Decisions</h3>
                <p className="text-2xl font-bold text-blue-600">1,234</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Average Approval Rate</h3>
                <p className="text-2xl font-bold text-green-600">92%</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>AI Decision Accuracy</Text>
                <Text>95%</Text>
              </div>
              <ProgressBar value={95} color="blue" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Human-AI Collaboration</Text>
                <Text>88%</Text>
              </div>
              <ProgressBar value={88} color="green" />
            </div>
            <Button size="sm" variant="secondary" className="w-full">
              View Detailed Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamPerformance; 