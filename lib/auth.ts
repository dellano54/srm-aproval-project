import { cookies } from 'next/headers';
import { UserRole } from './types';
import { jwtVerify } from 'jose';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  empId?: string;
  role: UserRole;
  college?: string;
  department?: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    
    // Check for JWT auth token
    const authToken = cookieStore.get('auth-token');
    if (authToken) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_secret_key_here'
        );
        
        const { payload } = await jwtVerify(authToken.value, secret);
        
        return {
          id: payload.id as string,
          email: payload.email as string,
          name: payload.name as string,
          empId: payload.empId as string | undefined,
          role: payload.role as UserRole,
          college: payload.college as string | undefined,
          department: payload.department as string | undefined,
        };
      } catch (jwtError) {
        // JWT verification failed
        return null;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canApproveRequest(userRole: UserRole, requestStatus: string): boolean {
  const approvalMatrix: Record<string, UserRole[]> = {
    'submitted': [UserRole.INSTITUTION_MANAGER],
    'manager_review': [UserRole.INSTITUTION_MANAGER, UserRole.ACCOUNTANT],
    'budget_check': [UserRole.ACCOUNTANT],
    'vp_approval': [UserRole.VP],
    'hoi_approval': [UserRole.HEAD_OF_INSTITUTION],
    'dean_review': [UserRole.DEAN],
    'chief_director_approval': [UserRole.CHIEF_DIRECTOR],
    'chairman_approval': [UserRole.CHAIRMAN],
  };

  return approvalMatrix[requestStatus]?.includes(userRole) || false;
}