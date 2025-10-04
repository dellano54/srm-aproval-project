import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { UserRole } from '../../../../lib/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, empId, email, password, role, college, department } = await request.json();
    
    // Validate required fields
    if (!name || !empId || !email || !password) {
      return NextResponse.json({ error: 'Name, employee ID, email, and password are required' }, { status: 400 });
    }
    
    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Check if user already exists by employee ID
    const existingUserByEmpId = await User.findOne({ empId });
    if (existingUserByEmpId) {
      return NextResponse.json({ error: 'User with this employee ID already exists' }, { status: 400 });
    }

    // Create user (password will be automatically hashed by the User model pre-save hook)
    const user = await User.create({
      name,
      empId,
      email,
      password, // Don't hash here - let the model do it
      role,
      college: college || null,
      department: department || null,
    });    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'User created successfully'
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}