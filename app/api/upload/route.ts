import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';
import connectDB from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), process.env.UPLOAD_DIR || './public/uploads');
    try {
      await stat(uploadDir);
    } catch {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to disk
    await writeFile(filePath, buffer);

    // Return file URL
    const fileUrl = `/uploads/${uniqueFilename}`;
    
    return NextResponse.json({ 
      url: fileUrl,
      filename: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}