import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Request from '../../../../models/Request';
import { getCurrentUser } from '../../../../lib/auth';
import { RequestStatus } from '../../../../lib/types';

export async function GET() {
  try {
    await connectDB();
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({
      status: { $nin: [RequestStatus.APPROVED, RequestStatus.REJECTED] }
    });
    const approvedRequests = await Request.countDocuments({
      status: RequestStatus.APPROVED
    });
    const rejectedRequests = await Request.countDocuments({
      status: RequestStatus.REJECTED
    });

    return NextResponse.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}