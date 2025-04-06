import React from 'react';
import { 
  UserGroupIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Team = () => {
  // Sample team data
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Logistics Manager',
      department: 'Operations',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D9488&color=fff'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Route Planner',
      department: 'Planning',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=0D9488&color=fff'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Fleet Manager',
      department: 'Operations',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=0D9488&color=fff'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Sustainability Analyst',
      department: 'Analytics',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=0D9488&color=fff'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Team Management</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your team members and their roles</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Team Members</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{teamMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UserPlusIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Positions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Members</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                  </a>
                  <a
                    href={`tel:${member.phone}`}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {member.department}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team; 