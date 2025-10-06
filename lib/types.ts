import { z } from 'zod';

export enum UserRole {
  REQUESTER = 'requester',
  INSTITUTION_MANAGER = 'institution_manager',
  SOP_VERIFIER = 'sop_verifier',
  ACCOUNTANT = 'accountant',
  VP = 'vp',
  HEAD_OF_INSTITUTION = 'head_of_institution',
  DEAN = 'dean',
  MMA = 'mma',
  HR = 'hr',
  AUDIT = 'audit',
  IT = 'it',
  CHIEF_DIRECTOR = 'chief_director',
  CHAIRMAN = 'chairman',
}

export enum RequestStatus {
  SUBMITTED = 'submitted',
  MANAGER_REVIEW = 'manager_review',
  SOP_VERIFICATION = 'sop_verification',
  BUDGET_CHECK = 'budget_check',
  INSTITUTION_VERIFIED = 'institution_verified',
  VP_APPROVAL = 'vp_approval',
  HOI_APPROVAL = 'hoi_approval',
  DEAN_REVIEW = 'dean_review',
  DEPARTMENT_CHECKS = 'department_checks',
  DEAN_VERIFICATION = 'dean_verification',
  CHIEF_DIRECTOR_APPROVAL = 'chief_director_approval',
  CHAIRMAN_APPROVAL = 'chairman_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLARIFICATION_REQUIRED = 'clarification_required',
  SOP_CLARIFICATION = 'sop_clarification',
  BUDGET_CLARIFICATION = 'budget_clarification',
  NO_BUDGET = 'no_budget',
  DEPARTMENT_CLARIFICATION = 'department_clarification',
}

export enum ActionType {
  CREATE = 'create',
  APPROVE = 'approve',
  REJECT = 'reject',
  CLARIFY = 'clarify',
  FORWARD = 'forward',
}

export const CreateRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  college: z.string().min(1, 'College is required'),
  department: z.string().min(1, 'Department is required'),
  costEstimate: z.number().min(1, 'Cost estimate must be greater than 0'),
  expenseCategory: z.string().min(1, 'Expense category is required'),
  sopReference: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  college?: string;
  department?: string;
  createdAt: Date;
}

export interface Request {
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
  createdAt: Date;
  updatedAt: Date;
  history: ApprovalHistory[];
}

export interface ApprovalHistory {
  _id: string;
  action: ActionType;
  actor: User;
  notes?: string;
  budgetAvailable?: boolean;
  forwardedMessage?: string;
  attachments?: string[];
  previousStatus?: RequestStatus;
  newStatus?: RequestStatus;
  target?: 'sop' | 'budget' | 'department';
  timestamp: Date;
}

export interface BudgetRecord {
  _id: string;
  college: string;
  department: string;
  category: string;
  allocated: number;
  spent: number;
  available: number;
  fiscalYear: string;
}

export interface SOPRecord {
  _id: string;
  code: string;
  title: string;
  description: string;
  college: string;
  department?: string;
  requiresBudgetCheck: boolean;
  minimumAmount?: number;
  isActive: boolean;
}

export interface AuditLog {
  _id: string;
  requestId: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
}