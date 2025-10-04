'use client';

import { useEffect, useState } from 'react';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, {
  credentials: 'include'
}).then(res => res.json());

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  myRequests?: number;
  pendingApprovals?: number;
}

export default function DashboardPage() {
  const { data: stats, error } = useSWR<DashboardStats>('/api/dashboard/stats', fetcher);
  const { data: recentRequests } = useSWR('/api/requests?limit=5', fetcher);

  const statsCards = [
    {
      name: 'Total Requests',
      stat: stats?.totalRequests || 0,
      icon: ClipboardDocumentListIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      name: 'Pending',
      stat: stats?.pendingRequests || 0,
      icon: ClockIcon,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      name: 'Approved',
      stat: stats?.approvedRequests || 0,
      icon: CheckCircleIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      name: 'Rejected',
      stat: stats?.rejectedRequests || 0,
      icon: ExclamationTriangleIcon,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
    },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8">
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((item) => (
            <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
              <dt>
                <div className={`absolute ${item.bgColor} rounded-md p-3`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Recent Requests */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Requests</h3>
            {recentRequests?.requests ? (
              <div className="mt-6 flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {recentRequests.requests.map((request: any) => (
                    <li key={request._id} className="py-5">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {request.college} • {request.department}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`status-badge ${getStatusClass(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-6 text-center py-4">
                <p className="text-gray-500">No recent requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: string) {
  switch (status) {
    case 'approved':
      return 'status-approved';
    case 'rejected':
      return 'status-rejected';
    case 'draft':
      return 'status-draft';
    default:
      return 'status-pending';
  }
}