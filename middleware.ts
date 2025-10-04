import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const method = req.method;
  const url = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  console.log(`[${new Date().toISOString()}] ${method} ${url} (IP: ${ip})`);

  return NextResponse.next();
}
