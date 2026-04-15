import { NextResponse } from 'next/server';

/**
 * @route GET /api/health
 * @description Health check endpoint migrated from Express
 */
export async function GET() {
  try {
    // Original logic adaptation
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[ERROR] Health check failed:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}