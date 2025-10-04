'use client';

import React from 'react';

interface ApprovalWorkflowProps {
  currentStatus: string;
  history?: Array<{newStatus?: string; previousStatus?: string}>;
}

const getStatusBadgeClass = (status: string, isCurrent: boolean, isCompleted: boolean) => {
  if (isCurrent) {
    return 'bg-blue-500 text-white';
  }
  if (isCompleted) {
    return 'bg-green-500 text-white';
  }
  return 'bg-gray-200 text-gray-600';
};

const getStatusDisplayName = (status: string) => {
  const statusMap: Record<string, string> = {
    'submitted': 'Submitted',
    'manager_review': 'Manager Review',
    'sop_verification': 'SOP Verification',
    'budget_check': 'Budget Check',
    'no_budget': 'No Budget Available',
    'institution_verified': 'Institution Verified',
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

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ currentStatus, history = [] }) => {
  const isNoBudgetPath = history.some(entry => 
    entry.newStatus === 'no_budget' || entry.previousStatus === 'no_budget'
  ) || currentStatus === 'no_budget';

  const normalWorkflowSteps = [
    { id: 'submitted', name: 'Submitted' },
    { id: 'manager_review', name: 'Manager Review' },
    { id: 'sop_verification', name: 'SOP Verification' },
    { id: 'budget_check', name: 'Budget Check' },
    { id: 'institution_verified', name: 'Institution Verified' },
    { id: 'vp_approval', name: 'VP Approval' },
    { id: 'hoi_approval', name: 'HOI Approval' },
    { id: 'dean_review', name: 'Dean Review' },
    { id: 'chief_director_approval', name: 'Chief Director Approval' },
    { id: 'chairman_approval', name: 'Chairman Approval' },
    { id: 'approved', name: 'Approved' },
  ];

  const noBudgetWorkflowSteps = [
    { id: 'submitted', name: 'Submitted' },
    { id: 'manager_review', name: 'Manager Review' },
    { id: 'sop_verification', name: 'SOP Verification' },
    { id: 'budget_check', name: 'Budget Check' },
    { id: 'no_budget', name: 'No Budget' },
    { id: 'dean_review', name: 'Dean Review' },
    { id: 'chairman_approval', name: 'Chairman' },
    { id: 'approved', name: 'Approved' },
  ];

  const workflowSteps = isNoBudgetPath ? noBudgetWorkflowSteps : normalWorkflowSteps;
  const isClarificationStatus = ['sop_clarification', 'budget_clarification', 'clarification_required', 'department_clarification'].includes(currentStatus);
  const currentStatusIndex = workflowSteps.findIndex(step => step.id === currentStatus);

  return (
    <div className="w-full overflow-hidden">
      {isNoBudgetPath && (
        <div className="mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base lg:text-lg font-medium text-orange-800 break-words">
                Expedited Approval Path
              </h4>
              <p className="text-xs sm:text-sm text-orange-700 mt-1 break-words">
                No budget available. Following expedited path: Institution Manager forwards directly to Dean, who then forwards to Chairman (skipping VP, HOI, and Chief Director).
              </p>
            </div>
          </div>
        </div>
      )}

      {isClarificationStatus && (
        <div className="mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base lg:text-lg font-medium text-yellow-800 break-words">
                {getStatusDisplayName(currentStatus)}
              </h4>
              <p className="text-xs sm:text-sm text-yellow-700 mt-1 break-words">
                {currentStatus === 'sop_clarification' && 'Waiting for SOP verification clarification'}
                {currentStatus === 'budget_clarification' && 'Waiting for budget clarification from Accountant'}
                {currentStatus === 'department_clarification' && 'Waiting for department clarification'}
                {currentStatus === 'clarification_required' && 'Waiting for clarification from Requester'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full">
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${Math.max(0, Math.min(100, (currentStatusIndex / (workflowSteps.length - 1)) * 100))}%` }}
              ></div>
            </div>
            
            <div className="relative z-10 flex justify-between">
              {workflowSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / workflowSteps.length}%` }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      getStatusBadgeClass(step.id, isCurrent, isCompleted)
                    }`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center px-1">
                      <span className={`text-xs font-medium break-words ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  getStatusBadgeClass(step.id, isCurrent, isCompleted)
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block truncate ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="md:hidden space-y-3">
          {workflowSteps.map((step, index) => {
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  getStatusBadgeClass(step.id, isCurrent, isCompleted)
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium block break-words ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-medium text-blue-800">Current Status</h3>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                <p className="break-words">
                  This request is currently in the{' '}
                  <span className="font-semibold">{getStatusDisplayName(currentStatus)}</span>{' '}
                  stage of the approval workflow.
                </p>
                {currentStatus === 'approved' && (
                  <p className="mt-1 break-words">The request has been fully approved and can now be processed.</p>
                )}
                {currentStatus === 'rejected' && (
                  <p className="mt-1 break-words">The request has been rejected and cannot proceed further.</p>
                )}
                {currentStatus === 'no_budget' && (
                  <p className="mt-1 break-words">No budget is available. Institution Manager can forward to Dean for expedited approval.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;