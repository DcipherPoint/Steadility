import React from 'react';
import { Card, Badge, Button, Table, ProgressBar, Title, Text, Grid, Col } from '@tremor/react';
import {
  TrophyIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const SustainabilityHub = () => {
  // Mock data - replace with actual data from your backend
  const leaderboardData = [
    { id: 1, name: 'Team Alpha', score: 950, badges: 12, rank: 1 },
    { id: 2, name: 'Team Beta', score: 850, badges: 10, rank: 2 },
    { id: 3, name: 'Team Gamma', score: 750, badges: 8, rank: 3 },
    { id: 4, name: 'Team Delta', score: 650, badges: 6, rank: 4 },
    { id: 5, name: 'Team Epsilon', score: 550, badges: 5, rank: 5 },
  ];

  const badges = [
    { id: 1, name: 'Green Champion', description: 'Achieved 100% sustainability score', icon: '🌱' },
    { id: 2, name: 'Carbon Warrior', description: 'Reduced CO2 emissions by 50%', icon: '🌍' },
    { id: 3, name: 'Eco Innovator', description: 'Implemented 5 green initiatives', icon: '💡' },
    { id: 4, name: 'Sustainable Leader', description: 'Led team to top sustainability ranking', icon: '🏆' },
  ];

  const carbonMarketplace = [
    { id: 1, type: 'Purchase', amount: 100, price: 25, date: '2024-03-13' },
    { id: 2, type: 'Sale', amount: 50, price: 25, date: '2024-03-12' },
    { id: 3, type: 'Donation', amount: 75, price: 0, date: '2024-03-11' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sustainability Hub</h1>
        <div className="flex items-center space-x-4">
          <Badge color="green">Active</Badge>
          <Button size="sm" variant="secondary">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Team Leaderboard</h2>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Score</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((team) => (
                <tr key={team.id}>
                  <td>#{team.rank}</td>
                  <td>{team.name}</td>
                  <td>{team.score}</td>
                  <td>{team.badges}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Badges Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">Your Badges</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Carbon Marketplace */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-semibold">Carbon Marketplace</h2>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {carbonMarketplace.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount} credits</td>
                  <td>${transaction.price}</td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="mt-4 flex space-x-2">
            <Button size="sm" variant="secondary" className="flex-1">
              Buy Credits
            </Button>
            <Button size="sm" variant="secondary" className="flex-1">
              Sell Credits
            </Button>
          </div>
        </Card>

        {/* Sustainability Progress */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ChartBarIcon className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Sustainability Progress</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Carbon Reduction</Text>
                <Text>75%</Text>
              </div>
              <ProgressBar value={75} color="green" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Energy Efficiency</Text>
                <Text>85%</Text>
              </div>
              <ProgressBar value={85} color="green" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Waste Reduction</Text>
                <Text>60%</Text>
              </div>
              <ProgressBar value={60} color="green" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SustainabilityHub; 