'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../../lib/types';
import { approvalEngine } from '../../../lib/approval-engine';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  empId?: string;
  role: UserRole;
  college?: string;
  department?: string;
}

interface Request {
  _id: string;
  title: string;
  purpose: string;
  college: string;
  department: string;
  costEstimate: number;
  expenseCategory: string;
  status: string;
  createdAt: string;
  requester: {
    name: string;
    email: string;
  };
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchPendingApprovals();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      const user = await response.json();
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setError('Failed to load user data');
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      // Fetch requests that need approval based on user role
      const response = await fetch('/api/requests?pendingApprovals=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'manager_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'budget_check':
        return 'bg-purple-100 text-purple-800';
      case 'vp_approval':
        return 'bg-indigo-100 text-indigo-800';
      case 'hoi_approval':
        return 'bg-pink-100 text-pink-800';
      case 'dean_review':
        return 'bg-orange-100 text-orange-800';
      case 'chief_director_approval':
        return 'bg-amber-100 text-amber-800';
      case 'chairman_approval':
        return 'bg-emerald-100 text-emerald-800';
      case 'clarification_required':
        return 'bg-rose-100 text-rose-800';
      case 'sop_clarification':
        return 'bg-red-100 text-red-800';
      case 'budget_clarification':
        return 'bg-red-100 text-red-800';
      case 'department_clarification':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'manager_review': 'Manager Review',
      'budget_check': 'Budget Check',
      'vp_approval': 'VP Approval',
      'hoi_approval': 'HOI Approval',
      'dean_review': 'Dean Review',
      'chief_director_approval': 'Chief Director Approval',
      'chairman_approval': 'Chairman Approval',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'clarification_required': 'Clarification Required',
      'sop_clarification': 'SOP Clarification',
      'budget_clarification': 'Budget Clarification',
      'department_clarification': 'Department Clarification'
    };
    
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600">Requests requiring your approval</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no requests requiring your approval.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {requests.map((request) => (
              <li key={request._id}>
                <div 
                  className="block hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/requests/${request._id}`)}
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{request.title}</p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}>
                          {getStatusDisplayName(request.status)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {request.purpose.substring(0, 100)}{request.purpose.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          Created on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ₹{request.costEstimate.toLocaleString()}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {request.college} - {request.department}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {request.expenseCategory}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Requested by: {request.requester.name} ({request.requester.email})
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}