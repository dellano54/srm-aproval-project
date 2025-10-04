'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../lib/types';

const roleOptions = [
  { value: UserRole.REQUESTER, label: 'Requester/HOD' },
  { value: UserRole.INSTITUTION_MANAGER, label: 'Institution Manager' },
  { value: UserRole.SOP_VERIFIER, label: 'SOP Verifier' },
  { value: UserRole.ACCOUNTANT, label: 'Accountant' },
  { value: UserRole.VP, label: 'Vice President' },
  { value: UserRole.HEAD_OF_INSTITUTION, label: 'Head of Institution' },
  { value: UserRole.DEAN, label: 'Dean' },
  { value: UserRole.MMA, label: 'MMA' },
  { value: UserRole.HR, label: 'HR' },
  { value: UserRole.AUDIT, label: 'Audit' },
  { value: UserRole.IT, label: 'IT' },
  { value: UserRole.CHIEF_DIRECTOR, label: 'Chief Director' },
  { value: UserRole.CHAIRMAN, label: 'Chairman' },
];

// Roles that require department field
const rolesWithDepartment = [
  UserRole.REQUESTER,
  UserRole.DEAN,
  UserRole.HEAD_OF_INSTITUTION
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.REQUESTER);
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if department is required for this role
    const isDepartmentRequired = rolesWithDepartment.includes(selectedRole);

    if (!name || !email || !password || !empId || !college || (isDepartmentRequired && !department)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          empId,
          email,
          password,
          role: selectedRole,
          college,
          department: rolesWithDepartment.includes(selectedRole) ? department : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page after successful signup
        router.push('/login?message=Signup successful. Please login.');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign up for SRM-RMP Institutional Approval System
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="empId" className="block text-sm font-medium text-gray-700">
                Employee ID *
              </label>
              <input
                id="empId"
                type="text"
                required
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="EMP12345"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                id="role"
                required
                value={selectedRole}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setSelectedRole(newRole);
                  // Clear department if the new role doesn't need it
                  if (!rolesWithDepartment.includes(newRole)) {
                    setDepartment('');
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                College *
              </label>
              <input
                id="college"
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your college name"
              />
            </div>

            {rolesWithDepartment.includes(selectedRole) && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <input
                  id="department"
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your department name"
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}