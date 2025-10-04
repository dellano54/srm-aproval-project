import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Request from '../../../../models/Request';
import { getCurrentUser } from '../../../../lib/auth';
import { UserRole } from '../../../../lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestRecord = await Request.findById(params.id)
      .populate('requester', 'name email empId _id')
      .populate('history.actor', 'name email empId');

    if (!requestRecord) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user has permission to view this request
    // Allow all roles that participate in the approval process to view requests
    const allowedRoles = [
      UserRole.REQUESTER,
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
    ];

    const canViewRequest = allowedRoles.includes(user.role) || 
                          requestRecord.requester._id.toString() === user.id;

    if (!canViewRequest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(requestRecord);
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const updatedRequest = await Request.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true }
    ).populate('requester', 'name email');

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deletedRequest = await Request.findByIdAndDelete(params.id);

    if (!deletedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}