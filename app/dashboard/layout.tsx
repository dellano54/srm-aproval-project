'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HomeIcon, 
  DocumentPlusIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

enum UserRole {
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
  CHAIRMAN = 'chairman'
}

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon,
    roles: Object.values(UserRole)
  },
  { 
    name: 'My Requests', 
    href: '/dashboard/requests', 
    icon: ClipboardDocumentListIcon,
    roles: [UserRole.REQUESTER]
  },
  { 
    name: 'Create Request', 
    href: '/dashboard/requests/create', 
    icon: DocumentPlusIcon,
    roles: [UserRole.REQUESTER]
  },
  { 
    name: 'Pending Approvals', 
    href: '/dashboard/approvals', 
    icon: ClipboardDocumentListIcon,
    roles: [
      UserRole.INSTITUTION_MANAGER, 
      UserRole.SOP_VERIFIER,
      UserRole.ACCOUNTANT, 
      UserRole.VP, 
      UserRole.HEAD_OF_INSTITUTION,
      UserRole.DEAN,
      UserRole.MMA,
      UserRole.HR,
      UserRole.AUDIT,
      UserRole.IT,
      UserRole.CHIEF_DIRECTOR,
      UserRole.CHAIRMAN
    ]
  },
  { 
    name: 'Budget Management', 
    href: '/dashboard/budget', 
    icon: ChartBarIcon,
    roles: [UserRole.ACCOUNTANT, UserRole.DEAN, UserRole.CHIEF_DIRECTOR]
  },
  { 
    name: 'User Management', 
    href: '/dashboard/users', 
    icon: UserGroupIcon,
    roles: [UserRole.CHIEF_DIRECTOR, UserRole.CHAIRMAN]
  },
  { 
    name: 'Audit Logs', 
    href: '/dashboard/audit', 
    icon: CogIcon,
    roles: [UserRole.AUDIT, UserRole.CHIEF_DIRECTOR, UserRole.CHAIRMAN]
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    router.push('/');
  };

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-blue-600 transform transition-transform">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-white text-lg font-semibold">
                  SRM-RMP Approval
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="text-white hover:bg-blue-700 group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors"
                  >
                    <item.icon className="text-white mr-4 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-blue-600 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-white text-lg font-semibold">
              SRM-RMP Approval
            </h1>
          </div>
          <nav className="mt-8 flex-1 flex flex-col overflow-y-auto" aria-label="Sidebar">
            <div className="px-2 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:bg-blue-700 group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md transition-colors"
                >
                  <item.icon className="text-white mr-4 flex-shrink-0 h-6 w-6" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 w-full overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              {/* Search or other content */}
            </div>
            <div className="ml-4 flex items-center gap-2 sm:gap-4">
              <div className="flex items-center">
                <span className="text-gray-700 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                  <span className="hidden sm:inline">Welcome, </span>
                  <span className="font-medium">{user?.name}</span>
                  <span className="hidden md:inline"> ({user?.role})</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}