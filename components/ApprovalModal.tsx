'use client';

import { useState, useRef, useEffect } from 'react';

interface UploadedFile {
  url: string;
  filename: string;
  size: number;
}

interface ApprovalModalProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: {
    action: string;
    notes?: string;
    budgetAvailable?: boolean | null;
    forwardedMessage?: string;
    attachments?: string[];
    target?: 'sop' | 'accountant' | 'mma' | 'hr' | 'audit' | 'it';
    forwardToSOP?: boolean;
    forwardToBudget?: boolean;
    forwardToVP?: boolean;
  }) => Promise<void>;
  currentStatus: string;
  userRole?: string;
  requestHistory?: any[];
}

export default function ApprovalModal({ 
  requestId, 
  isOpen, 
  onClose, 
  onApprove,
  currentStatus,
  userRole,
  requestHistory = []
}: ApprovalModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [action, setAction] = useState('approve');
  const [notes, setNotes] = useState('');
  const [budgetAvailable, setBudgetAvailable] = useState<boolean | null>(null);
  const [forwardedMessage, setForwardedMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clarifyTarget, setClarifyTarget] = useState<'sop' | 'accountant' | 'mma' | 'hr' | 'audit' | 'it' | ''>('');
  const [forwardTarget, setForwardTarget] = useState<'sop' | 'budget' | 'vp'>('sop');

  const clarificationOnlyRoles = ['mma', 'hr', 'audit', 'it'];
  const isClarificationOnlyUser = clarificationOnlyRoles.includes(userRole || '');
  const isInstitutionManager = userRole === 'institution_manager';
  const forwardOnlyRoles = ['vp', 'head_of_institution', 'chief_director'];
  const isForwardOnlyUser = forwardOnlyRoles.includes(userRole || '');
  const isChairman = userRole === 'chairman';
  const isDean = userRole === 'dean';
  const isSopVerifier = userRole === 'sop_verifier';
  const isAccountant = userRole === 'accountant';
  const isClarificationStatus = currentStatus === 'sop_clarification' || 
                               currentStatus === 'budget_clarification' || 
                               currentStatus === 'department_clarification';
  const canRequestClarification = userRole === 'institution_manager' || userRole === 'dean';
  
  const canInstitutionManagerForward = isInstitutionManager && 
    (currentStatus === 'institution_verified' || 
     currentStatus === 'no_budget' ||
     currentStatus === 'manager_review');
  
  // Check if at least one verification (SOP or Budget) has been done
    const hasVerificationHistory = (history: any[]) => {
      return history.some((entry: any) => 
        entry.newStatus === 'sop_verification' || 
        entry.previousStatus === 'sop_verification' ||
        entry.newStatus === 'budget_check' ||
        entry.previousStatus === 'budget_check' ||
        entry.newStatus === 'sop_clarification' ||
        entry.previousStatus === 'sop_clarification' ||
        entry.newStatus === 'budget_clarification' ||
        entry.previousStatus === 'budget_clarification' ||
        (entry.actor?.role === 'sop_verifier' && entry.action === 'approve') ||
        (entry.actor?.role === 'accountant' && entry.action === 'approve') ||
        entry.sopAvailable !== undefined ||
        entry.budgetAvailable !== undefined
      );
    };

  useEffect(() => {
    if (isClarificationOnlyUser && isClarificationStatus) {
      if (action !== 'clarify') {
        setAction('clarify');
        setClarifyTarget('');
      }
    } else if (isChairman) {
      if (!['approve', 'reject'].includes(action)) {
        setAction('approve');
        setClarifyTarget('');
      }
    } else if (isForwardOnlyUser) {
      if (!['forward', 'reject'].includes(action)) {
        setAction('forward');
        setClarifyTarget('');
      }
    } else if (isInstitutionManager) {
      if (canInstitutionManagerForward) {
        if (!['forward', 'reject', 'clarify'].includes(action)) {
          setAction('forward');
          setClarifyTarget('');
        }
      } else {
        if (!['reject', 'clarify'].includes(action)) {
          setAction('reject');
          setClarifyTarget('');
        }
      }
    } else if (isDean) {
      if (!['reject', 'clarify', 'forward'].includes(action)) {
        setAction('reject');
        setClarifyTarget('');
      }
    } else if (!canRequestClarification && action === 'clarify') {
      setAction('approve');
      setClarifyTarget('');
    }
  }, [canRequestClarification, action, isClarificationOnlyUser, isClarificationStatus, isChairman, isForwardOnlyUser, isInstitutionManager, isDean, canInstitutionManagerForward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onApprove({
        action,
        notes: action !== 'forward' ? notes : undefined,
        budgetAvailable: budgetAvailable,
        forwardedMessage: action === 'forward' ? forwardedMessage : undefined,
        attachments: [...attachments, ...uploadedFiles.map(file => file.url)],
        target: action === 'clarify' && clarifyTarget ? clarifyTarget : undefined,
        forwardToSOP: action === 'forward' && forwardTarget === 'sop',
        forwardToBudget: action === 'forward' && forwardTarget === 'budget',
        forwardToVP: action === 'forward' && forwardTarget === 'vp',
      });
      setAction('approve');
      setNotes('');
      setBudgetAvailable(null);
      setForwardedMessage('');
      setAttachments([]);
      setUploadedFiles([]);
      setClarifyTarget('');
      setForwardTarget('sop');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }
        
        const result = await response.json();
        setUploadedFiles(prev => [...prev, result]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAttachmentUrl = () => {
    const url = prompt('Enter document URL:');
    if (url) {
      setAttachments([...attachments, url]);
    }
  };

  const handleRemoveAttachmentUrl = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg my-8">
        <div className="px-4 sm:px-6 py-4 border-b sticky top-0 bg-white rounded-t-lg z-10">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Process Request</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">Current status: {currentStatus}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-xs sm:text-sm break-words">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                if (e.target.value !== 'clarify') setClarifyTarget('');
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm p-2 border"
            >
              {isClarificationOnlyUser && isClarificationStatus ? (
                <option value="clarify">Submit Clarification Response</option>
              ) : isChairman ? (
                <>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </>
              ) : isForwardOnlyUser ? (
                <>
                  <option value="forward">Forward</option>
                  <option value="reject">Reject</option>
                </>
              ) : isInstitutionManager ? (
                canInstitutionManagerForward ? (
                  <>
                    <option value="forward">Forward</option>
                    <option value="reject">Reject</option>
                    <option value="clarify">Request Clarification</option>
                  </>
                ) : (
                  <>
                    <option value="reject">Reject</option>
                    <option value="clarify">Request Clarification</option>
                  </>
                )
              ) : isDean ? (
                <>
                  <option value="reject">Reject</option>
                  <option value="clarify">Request Clarification</option>
                  <option value="forward">Forward</option>
                </>
              ) : isSopVerifier && currentStatus === 'sop_clarification' ? (
                <option value="clarify">Submit Clarification Response</option>
              ) : (
                <>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  {canRequestClarification && (
                    <option value="clarify">Request Clarification</option>
                  )}
                  <option value="forward">Forward</option>
                </>
              )}
            </select>
          </div>
          
          {action === 'clarify' && !isClarificationOnlyUser && (userRole === 'institution_manager' || userRole === 'dean') && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Clarification Target
              </label>
              <select
                value={clarifyTarget}
                onChange={e => setClarifyTarget(e.target.value as 'sop' | 'accountant' | 'mma' | 'hr' | 'audit' | 'it')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm p-2 border"
                required
              >
                <option value="">Select target...</option>
                {userRole === 'institution_manager' && (
                  <>
                    <option value="sop">SOP Verifier (Material Check)</option>
                    <option value="accountant">Accountant (Budget Check)</option>
                  </>
                )}
                {userRole === 'dean' && (
                  <>
                    <option value="mma">MMA (Department)</option>
                    <option value="hr">HR (Department)</option>
                    <option value="audit">Audit (Department)</option>
                    <option value="it">IT (Department)</option>
                  </>
                )}
              </select>
            </div>
          )}

          {action === 'clarify' && (isClarificationOnlyUser || (isSopVerifier && currentStatus === 'sop_clarification')) && isClarificationStatus && (
            <div className="text-xs sm:text-sm text-blue-600 bg-blue-50 p-3 rounded-md break-words">
              You are responding to a clarification request. Please provide the requested information in the notes section below.
            </div>
          )}

          {action === 'forward' ? (
            <>
              {/* Forward Target Selection for Institution Manager at MANAGER_REVIEW */}
              {isInstitutionManager && currentStatus === 'manager_review' && (
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Forward To
                  </label>
                  <div className="flex flex-col gap-2">
                    {/* Only show VP option if at least one verification has been done */}
                    {hasVerificationHistory(requestHistory) && (
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          checked={forwardTarget === 'vp'}
                          onChange={() => setForwardTarget('vp')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-xs sm:text-sm">VP Approval (After Verification)</span>
                      </label>
                    )}
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={forwardTarget === 'sop'}
                        onChange={() => setForwardTarget('sop')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs sm:text-sm">SOP Verification</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={forwardTarget === 'budget'}
                        onChange={() => setForwardTarget('budget')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs sm:text-sm">Budget Check</span>
                    </label>
                  </div>
                  {!hasVerificationHistory(requestHistory) && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ VP Approval requires at least one verification (SOP or Budget) to be completed first.
                    </p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Forward Message
                </label>
                <textarea
                  value={forwardedMessage}
                  onChange={(e) => setForwardedMessage(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm p-2 border resize-none"
                  placeholder="Enter message for forwarding..."
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs sm:text-sm p-2 border resize-none"
                placeholder="Enter notes..."
              />
            </div>
          )}
          
          {/* Budget Available - Only for Accountant */}
          {(isAccountant && (action === 'approve' || 
            (currentStatus === 'budget_clarification' && action === 'clarify'))) && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Budget Available
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === true}
                    onChange={() => setBudgetAvailable(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === false}
                    onChange={() => setBudgetAvailable(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">No</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === null}
                    onChange={() => setBudgetAvailable(null)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">Not Applicable</span>
                </label>
              </div>
            </div>
          )}
          
          {/* SOP Available - Only for SOP Verifier */}
          {(isSopVerifier && (action === 'approve' || 
            (currentStatus === 'sop_clarification' && action === 'clarify'))) && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                SOP Material Available
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === true}
                    onChange={() => setBudgetAvailable(true)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">Available</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === false}
                    onChange={() => setBudgetAvailable(false)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">Not Available</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={budgetAvailable === null}
                    onChange={() => setBudgetAvailable(null)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs sm:text-sm">Not Applicable</span>
                </label>
              </div>
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">
                Document Attachments
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={handleAddAttachmentUrl}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                >
                  Add URL
                </button>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <ul className="border rounded-md divide-y mb-2">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="flex justify-between items-center p-2 gap-2">
                    <span className="text-xs sm:text-sm truncate flex-1 min-w-0">{file.filename}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {attachments.length > 0 && (
              <ul className="border rounded-md divide-y mb-2">
                {attachments.map((attachment, index) => (
                  <li key={index} className="flex justify-between items-center p-2 gap-2">
                    <span className="text-xs sm:text-sm truncate flex-1 min-w-0">{attachment}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachmentUrl(index)}
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm flex-shrink-0"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {uploadedFiles.length === 0 && attachments.length === 0 && (
              <p className="text-xs sm:text-sm text-gray-500">No attachments added</p>
            )}
          </div>
        </form>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}