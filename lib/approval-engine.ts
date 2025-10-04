import { RequestStatus, UserRole, ActionType } from './types';

export interface ApprovalRule {
  from: RequestStatus;
  to: RequestStatus;
  requiredRole: UserRole;
  condition?: (context: any) => boolean;
}

export class ApprovalEngine {
  private rules: ApprovalRule[] = [
    // Request Raiser (HOD/Faculty) → Institution Manager(s)
    { from: RequestStatus.SUBMITTED, to: RequestStatus.MANAGER_REVIEW, requiredRole: UserRole.INSTITUTION_MANAGER },

    // Institution Manager(s) → SOP Verification (Material Check)
    { from: RequestStatus.MANAGER_REVIEW, to: RequestStatus.SOP_VERIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },

    // Institution Manager can request SOP clarification
    { from: RequestStatus.MANAGER_REVIEW, to: RequestStatus.SOP_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.SOP_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },
    { from: RequestStatus.BUDGET_CHECK, to: RequestStatus.SOP_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },

    // Institution Manager can request Budget clarification  
    { from: RequestStatus.MANAGER_REVIEW, to: RequestStatus.BUDGET_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },
    { from: RequestStatus.BUDGET_CHECK, to: RequestStatus.BUDGET_CLARIFICATION, requiredRole: UserRole.INSTITUTION_MANAGER },

    // Dean can request Department clarification from the 4 department users
    { from: RequestStatus.DEAN_REVIEW, to: RequestStatus.DEPARTMENT_CLARIFICATION, requiredRole: UserRole.DEAN },

    // SOP Verifier can return from SOP clarification to Institution Manager
    { from: RequestStatus.SOP_CLARIFICATION, to: RequestStatus.MANAGER_REVIEW, requiredRole: UserRole.SOP_VERIFIER },

    // Accountant can return from Budget clarification to Institution Manager
    { from: RequestStatus.BUDGET_CLARIFICATION, to: RequestStatus.MANAGER_REVIEW, requiredRole: UserRole.ACCOUNTANT },

    // Department users can return from Department clarification to Dean Review
    { from: RequestStatus.DEPARTMENT_CLARIFICATION, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.MMA },
    { from: RequestStatus.DEPARTMENT_CLARIFICATION, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.HR },
    { from: RequestStatus.DEPARTMENT_CLARIFICATION, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.AUDIT },
    { from: RequestStatus.DEPARTMENT_CLARIFICATION, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.IT },

    // SOP Verification → Budget Check - Department users or SOP Verifier can approve
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CHECK, requiredRole: UserRole.MMA },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CHECK, requiredRole: UserRole.HR },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CHECK, requiredRole: UserRole.AUDIT },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CHECK, requiredRole: UserRole.IT },
    { from: RequestStatus.SOP_VERIFICATION, to: RequestStatus.BUDGET_CHECK, requiredRole: UserRole.SOP_VERIFIER },

    // Accountant Verify → Institution Verified (when budget is available)
    { from: RequestStatus.BUDGET_CHECK, to: RequestStatus.INSTITUTION_VERIFIED, requiredRole: UserRole.ACCOUNTANT, condition: (ctx) => ctx.budgetAvailable === true },
    
    // Accountant Verify → NO_BUDGET (when budget is NOT available) - CRITICAL PATH
    { from: RequestStatus.BUDGET_CHECK, to: RequestStatus.NO_BUDGET, requiredRole: UserRole.ACCOUNTANT, condition: (ctx) => ctx.budgetAvailable === false },

    // Institution Verified → VP Approval (normal flow when budget available)
    { from: RequestStatus.INSTITUTION_VERIFIED, to: RequestStatus.VP_APPROVAL, requiredRole: UserRole.INSTITUTION_MANAGER },

    // NO_BUDGET → DEAN_REVIEW (expedited path for budget issues)
    { from: RequestStatus.NO_BUDGET, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.INSTITUTION_MANAGER },

    // VP Approval → Head of Institution
    { from: RequestStatus.VP_APPROVAL, to: RequestStatus.HOI_APPROVAL, requiredRole: UserRole.VP },

    // Head of Institution → Dean Review
    { from: RequestStatus.HOI_APPROVAL, to: RequestStatus.DEAN_REVIEW, requiredRole: UserRole.HEAD_OF_INSTITUTION },

    // Dean Review → Department Checks (for detailed verification)
    { from: RequestStatus.DEAN_REVIEW, to: RequestStatus.DEPARTMENT_CHECKS, requiredRole: UserRole.DEAN },
    
    // Dean Review → Chairman (expedited path - for NO_BUDGET cases) - UPDATED TO SKIP CHIEF DIRECTOR
    { from: RequestStatus.DEAN_REVIEW, to: RequestStatus.CHAIRMAN_APPROVAL, requiredRole: UserRole.DEAN, condition: (ctx) => ctx.isNoBudgetPath === true },
    
    // Dean Review → Dean Verification (normal flow)
    { from: RequestStatus.DEAN_REVIEW, to: RequestStatus.DEAN_VERIFICATION, requiredRole: UserRole.DEAN },

    // Department users verify and send to Dean Verification
    { from: RequestStatus.DEPARTMENT_CHECKS, to: RequestStatus.DEAN_VERIFICATION, requiredRole: UserRole.MMA },
    { from: RequestStatus.DEPARTMENT_CHECKS, to: RequestStatus.DEAN_VERIFICATION, requiredRole: UserRole.HR },
    { from: RequestStatus.DEPARTMENT_CHECKS, to: RequestStatus.DEAN_VERIFICATION, requiredRole: UserRole.AUDIT },
    { from: RequestStatus.DEPARTMENT_CHECKS, to: RequestStatus.DEAN_VERIFICATION, requiredRole: UserRole.IT },

    // Dean Verification → Chief Director
    { from: RequestStatus.DEAN_VERIFICATION, to: RequestStatus.CHIEF_DIRECTOR_APPROVAL, requiredRole: UserRole.DEAN },

    // Chief Director → Chairman
    { from: RequestStatus.CHIEF_DIRECTOR_APPROVAL, to: RequestStatus.CHAIRMAN_APPROVAL, requiredRole: UserRole.CHIEF_DIRECTOR },

    // Chairman → Final Approval
    { from: RequestStatus.CHAIRMAN_APPROVAL, to: RequestStatus.APPROVED, requiredRole: UserRole.CHAIRMAN },
  ];

  getNextStatus(currentStatus: RequestStatus, action: ActionType, userRole: UserRole, context: any = {}): RequestStatus | null {
    if (action === ActionType.REJECT) {
      return RequestStatus.REJECTED;
    }

    if (action === ActionType.CLARIFY) {
      // Only Institution Manager can request SOP and Budget clarifications
      if (userRole === UserRole.INSTITUTION_MANAGER) {
        if (context.clarificationType === 'sop') {
          return RequestStatus.SOP_CLARIFICATION;
        } else if (context.clarificationType === 'accountant') {
          return RequestStatus.BUDGET_CLARIFICATION;
        }
      }
      
      // Dean can request Department clarification from MMA, HR, Audit, IT
      if (userRole === UserRole.DEAN) {
        if (context.clarificationType === 'department') {
          return RequestStatus.DEPARTMENT_CLARIFICATION;
        }
      }
      
      // Default clarification for other roles (if any)
      return RequestStatus.CLARIFICATION_REQUIRED;
    }
    
    // For forward action, determine the next appropriate status
    if (action === ActionType.FORWARD) {
      // Institution Manager forwards from NO_BUDGET to Dean (expedited path)
      if (currentStatus === RequestStatus.NO_BUDGET && userRole === UserRole.INSTITUTION_MANAGER) {
        return RequestStatus.DEAN_REVIEW;
      }
      
      // Institution Manager forwards from INSTITUTION_VERIFIED to VP (normal path)
      if (currentStatus === RequestStatus.INSTITUTION_VERIFIED && userRole === UserRole.INSTITUTION_MANAGER) {
        return RequestStatus.VP_APPROVAL;
      }
      
      // VP forwards to HOI
      if (currentStatus === RequestStatus.VP_APPROVAL && userRole === UserRole.VP) {
        return RequestStatus.HOI_APPROVAL;
      }
      
      // HOI forwards to Dean
      if (currentStatus === RequestStatus.HOI_APPROVAL && userRole === UserRole.HEAD_OF_INSTITUTION) {
        return RequestStatus.DEAN_REVIEW;
      }
      
      // Dean forwards - check if it's expedited NO_BUDGET path
      if (currentStatus === RequestStatus.DEAN_REVIEW && userRole === UserRole.DEAN) {
        // If coming from NO_BUDGET path, go directly to Chairman (UPDATED - SKIP CHIEF DIRECTOR)
        if (context.isNoBudgetPath === true) {
          return RequestStatus.CHAIRMAN_APPROVAL;
        }
        // Otherwise, go to Department Checks or Dean Verification
        return RequestStatus.DEPARTMENT_CHECKS;
      }
      
      // Dean forwards from Dean Verification to Chief Director
      if (currentStatus === RequestStatus.DEAN_VERIFICATION && userRole === UserRole.DEAN) {
        return RequestStatus.CHIEF_DIRECTOR_APPROVAL;
      }
      
      // Chief Director forwards to Chairman
      if (currentStatus === RequestStatus.CHIEF_DIRECTOR_APPROVAL && userRole === UserRole.CHIEF_DIRECTOR) {
        return RequestStatus.CHAIRMAN_APPROVAL;
      }
      
      // For other cases, status remains the same
      return currentStatus;
    }

    // Find applicable rules based on current status and user role
    const applicableRules = this.rules.filter(rule => 
      rule.from === currentStatus && rule.requiredRole === userRole
    );

    // Evaluate conditions and return the first matching rule
    for (const rule of applicableRules) {
      if (!rule.condition || rule.condition(context)) {
        return rule.to;
      }
    }

    return null;
  }

  getRequiredApprover(status: RequestStatus): UserRole[] {
    const approvers: Record<RequestStatus, UserRole[]> = {
      [RequestStatus.SUBMITTED]: [UserRole.INSTITUTION_MANAGER],
      [RequestStatus.MANAGER_REVIEW]: [UserRole.INSTITUTION_MANAGER],
      [RequestStatus.SOP_VERIFICATION]: [UserRole.MMA, UserRole.HR, UserRole.AUDIT, UserRole.IT, UserRole.SOP_VERIFIER],
      [RequestStatus.BUDGET_CHECK]: [UserRole.ACCOUNTANT],
      [RequestStatus.NO_BUDGET]: [UserRole.INSTITUTION_MANAGER],
      [RequestStatus.INSTITUTION_VERIFIED]: [UserRole.INSTITUTION_MANAGER],
      [RequestStatus.VP_APPROVAL]: [UserRole.VP],
      [RequestStatus.HOI_APPROVAL]: [UserRole.HEAD_OF_INSTITUTION],
      [RequestStatus.DEAN_REVIEW]: [UserRole.DEAN],
      [RequestStatus.DEPARTMENT_CHECKS]: [UserRole.MMA, UserRole.HR, UserRole.AUDIT, UserRole.IT],
      [RequestStatus.DEAN_VERIFICATION]: [UserRole.DEAN],
      [RequestStatus.CHIEF_DIRECTOR_APPROVAL]: [UserRole.CHIEF_DIRECTOR],
      [RequestStatus.CHAIRMAN_APPROVAL]: [UserRole.CHAIRMAN],
      [RequestStatus.APPROVED]: [],
      [RequestStatus.REJECTED]: [],
      [RequestStatus.CLARIFICATION_REQUIRED]: [UserRole.REQUESTER],
      [RequestStatus.SOP_CLARIFICATION]: [UserRole.SOP_VERIFIER, UserRole.MMA, UserRole.HR, UserRole.AUDIT, UserRole.IT],
      [RequestStatus.BUDGET_CLARIFICATION]: [UserRole.ACCOUNTANT],
      [RequestStatus.DEPARTMENT_CLARIFICATION]: [UserRole.MMA, UserRole.HR, UserRole.AUDIT, UserRole.IT],
    };

    return approvers[status] || [];
  }

  getStatusProgress(status: RequestStatus): { step: number; total: number } {
    const statusOrder = [
      RequestStatus.SUBMITTED,
      RequestStatus.MANAGER_REVIEW,
      RequestStatus.SOP_VERIFICATION,
      RequestStatus.BUDGET_CHECK,
      RequestStatus.INSTITUTION_VERIFIED,
      RequestStatus.VP_APPROVAL,
      RequestStatus.HOI_APPROVAL,
      RequestStatus.DEAN_REVIEW,
      RequestStatus.DEPARTMENT_CHECKS,
      RequestStatus.DEAN_VERIFICATION,
      RequestStatus.CHIEF_DIRECTOR_APPROVAL,
      RequestStatus.CHAIRMAN_APPROVAL,
      RequestStatus.APPROVED,
    ];

    const step = statusOrder.indexOf(status) + 1;
    return { step: Math.max(step, 1), total: statusOrder.length };
  }
  
  // Helper method to check if request is on NO_BUDGET path
  isNoBudgetPath(request: any): boolean {
    // Check if any history entry has status NO_BUDGET
    if (request.history && Array.isArray(request.history)) {
      return request.history.some((entry: any) => 
        entry.newStatus === RequestStatus.NO_BUDGET || 
        entry.previousStatus === RequestStatus.NO_BUDGET
      );
    }
    return request.status === RequestStatus.NO_BUDGET;
  }
}

export const approvalEngine = new ApprovalEngine();