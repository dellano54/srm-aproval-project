import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Request from '../../../models/Request';
import User from '../../../models/User';
import AuditLog from '../../../models/AuditLog';
import { getCurrentUser } from '../../../lib/auth';
import { CreateRequestSchema } from '../../../lib/types';
import { RequestStatus, ActionType, UserRole } from '../../../lib/types';
import mongoose from 'mongoose';
import { approvalEngine } from '../../../lib/approval-engine';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const college = searchParams.get('college');
    const pendingApprovals = searchParams.get('pendingApprovals') === 'true';
    
    let filter: any = {};
    
    if (pendingApprovals) {
      // For pending approvals, we need to find requests where the current user's role matches the required approver
      // First, get all requests that are not in final states
      filter.status = {
        $nin: [RequestStatus.APPROVED, RequestStatus.REJECTED, RequestStatus.CLARIFICATION_REQUIRED]
      };
      
      // Additional filtering based on user role for approvals
      if (user.role !== UserRole.REQUESTER) {
        // For non-requesters, we'll need to implement custom logic to filter by approver role
        // This is a simplified approach - in a full implementation, you'd want to check the approval engine
        // For now, we'll return all non-final requests for approvers to filter client-side
      } else {
        // For requesters, only show their own requests
        if (mongoose.Types.ObjectId.isValid(user.id)) {
          filter.requester = user.id;
        } else {
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            filter.requester = dbUser._id;
          }
        }
      }
    } else {
      // Role-based filtering for regular requests
      if (user.role === UserRole.REQUESTER) {
        // For requesters, only show their own requests
        if (mongoose.Types.ObjectId.isValid(user.id)) {
          filter.requester = user.id;
        } else {
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            filter.requester = dbUser._id;
          }
        }
      }
    }
    
    if (status && status !== 'pending') {
      filter.status = status;
    }
    
    if (college) {
      filter.college = college;
    }

    const skip = (page - 1) * limit;
    
    const requests = await Request.find(filter)
      .populate('requester', 'name email empId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter requests for pending approvals based on user role
    let filteredRequests = requests;
    if (pendingApprovals && user.role !== UserRole.REQUESTER) {
      filteredRequests = requests.filter(request => {
        const requiredApprovers = approvalEngine.getRequiredApprover(request.status as RequestStatus);
        return requiredApprovers.includes(user.role as UserRole);
      });
    }

    const total = await Request.countDocuments(filter);

    return NextResponse.json({
      requests: filteredRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user || user.role !== UserRole.REQUESTER) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateRequestSchema.parse(body);

    // Find the requester user (should already exist from authentication)
    const requesterUser = await User.findOne({ email: user.email });
    if (!requesterUser) {
      return NextResponse.json({ error: 'User not found. Please ensure you are properly authenticated.' }, { status: 404 });
    }

    const newRequest = await Request.create({
      ...validatedData,
      requester: requesterUser._id,
      status: RequestStatus.SUBMITTED, // Directly submit instead of draft
      history: [{
        action: ActionType.CREATE,
        actor: requesterUser._id,
        timestamp: new Date(),
        notes: 'Request directly submitted',
        newStatus: RequestStatus.SUBMITTED,
      }],
    });

    // Log audit
    await AuditLog.create({
      requestId: newRequest._id,
      userId: requesterUser._id,
      action: 'create_request',
      details: { requestData: validatedData },
    });

    const populatedRequest = await Request.findById(newRequest._id)
      .populate('requester', 'name email empId');

    return NextResponse.json(populatedRequest, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}