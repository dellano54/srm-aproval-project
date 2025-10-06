'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ApprovalModal from '../../../../components/ApprovalModal';
import ApprovalHistory from '../../../../components/ApprovalHistory';
import ApprovalWorkflow from '../../../../components/ApprovalWorkflow';
import { RequestStatus, ActionType, UserRole } from '../../../../lib/types';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

interface ApprovalHistoryItem {
  _id: string;
  action: ActionType;
  actor: User;
  notes?: string;
  budgetAvailable?: boolean;
  forwardedMessage?: string;
  attachments?: string[];
  previousStatus?: RequestStatus;
  newStatus?: RequestStatus;
  timestamp: Date;
}

interface Request {
  _id: string;
  title: string;
  purpose: string;
  college: string;
  department: string;
  costEstimate: number;
  expenseCategory: string;
  sopReference?: string;
  attachments: string[];
  requester: User;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  history: ApprovalHistoryItem[];
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchRequest();
    fetchCurrentUser();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  };

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requests/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Request not found');
        }
        throw new Error('Failed to fetch request');
      }
      
      const data = await response.json();
      setRequest(data);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError(err instanceof Error ? err.message : 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalData: any) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process approval');
      }
      
      await fetchRequest();
      setIsApprovalModalOpen(false);
    } catch (err) {
      throw err;
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

  const getFileNameFromUrl = (url: string) => {
    if (!url) return 'Document';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Document';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 break-words">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/requests')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="mr-1 h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Back to Requests</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline break-words">{error}</span>
          </div>
        )}

        {/* Request Details Card */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex-1 min-w-0 w-full md:w-auto">
                <h3 className="text-lg leading-6 font-medium text-gray-900 break-words">{request.title}</h3>
                <p className="mt-1 text-sm text-gray-500 break-words">{request.purpose}</p>
              </div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${getStatusBadgeClass(request.status)}`}>
                {getStatusDisplayName(request.status)}
              </span>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Request Details</h4>
                <dl className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Request ID</dt>
                    <dd className="text-sm text-gray-900 break-all sm:text-right">{request._id}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Requester</dt>
                    <dd className="text-sm text-gray-900 break-words sm:text-right">{request.requester.name}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Email</dt>
                    <dd className="text-sm text-gray-900 break-all sm:text-right">{request.requester.email}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">College</dt>
                    <dd className="text-sm text-gray-900 break-words sm:text-right">{request.college}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Department</dt>
                    <dd className="text-sm text-gray-900 break-words sm:text-right">{request.department}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Financial Details</h4>
                <dl className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Cost Estimate</dt>
                    <dd className="text-sm text-gray-900 sm:text-right">₹{request.costEstimate.toLocaleString()}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Expense Category</dt>
                    <dd className="text-sm text-gray-900 break-words sm:text-right">{request.expenseCategory}</dd>
                  </div>
                  {request.sopReference && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <dt className="text-sm font-medium text-gray-500 flex-shrink-0">SOP Reference</dt>
                      <dd className="text-sm text-gray-900 break-words sm:text-right">{request.sopReference}</dd>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-sm font-medium text-gray-500 flex-shrink-0">Created</dt>
                    <dd className="text-sm text-gray-900 sm:text-right">{new Date(request.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            {/* Document Attachments */}
            {request.attachments && request.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Document Attachments</h4>
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {request.attachments.map((attachment, index) => (
                    <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm gap-3">
                      <div className="flex items-center min-w-0 flex-1">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-2 truncate">{getFileNameFromUrl(attachment)}</span>
                      </div>
                      <div className="flex-shrink-0">
                        <a 
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          View
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Action Buttons - Updated to include SOP Verifier */}
            {(() => {
              // Department users can only respond to clarification
              const clarificationOnlyRoles = ['mma', 'hr', 'audit', 'it'];
              const isClarificationOnlyUser = clarificationOnlyRoles.includes(currentUser?.role || '');
              const isClarificationStatus = request.status === 'sop_clarification' || 
                                           request.status === 'budget_clarification' || 
                                           request.status === 'department_clarification';
              
              const isRequester = currentUser?.role === 'requester';
              
              // SOP Verifier can act in regular flow OR when responding to clarification
              const isSopVerifier = currentUser?.role === 'sop_verifier';
              const canSopVerifierAct = isSopVerifier && 
                (request.status === 'sop_verification' || request.status === 'sop_clarification');
              
              const shouldShowButton = !isRequester && 
                                      (canSopVerifierAct ||
                                       (!isClarificationOnlyUser || 
                                        (isClarificationOnlyUser && isClarificationStatus)));
              
              return shouldShowButton ? (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsApprovalModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    {(isClarificationOnlyUser || (isSopVerifier && request.status === 'sop_clarification')) && isClarificationStatus 
                      ? 'Respond to Clarification' 
                      : 'Process Request'}
                  </button>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {/* Workflow Visualization */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Approval Workflow</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="w-full">
              <ApprovalWorkflow 
                currentStatus={request.status} 
                history={request.history} 
              />
            </div>
          </div>
        </div>

        {/* Enhanced History Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Approval History</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="w-full">
              <ApprovalHistory history={request.history} currentStatus={request.status} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Approval Modal */}
      <ApprovalModal
        requestId={params.id}
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApprove={handleApprove}
        currentStatus={request.status}
        userRole={currentUser?.role}
        requestHistory={request.history}
      />
    </div>
  );
}