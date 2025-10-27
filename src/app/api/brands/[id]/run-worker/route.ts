import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// POST trigger worker for a specific brand
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🚀 Triggering worker for brand ID: ${id}`);

    // Path to the worker script
    const workerPath = path.join(process.cwd(), 'worker', 'seller-central-login.js');

    // Spawn the worker process with the brand ID
    const workerProcess = spawn('node', [workerPath], {
      env: {
        ...process.env,
        BRAND_ID: id,
      },
      cwd: path.join(process.cwd(), 'worker'),
      detached: true,
      stdio: 'ignore', // Run in background without blocking
    });

    // Detach the process so it continues running independently
    workerProcess.unref();

    return NextResponse.json({
      success: true,
      message: 'Worker process started successfully',
      brandId: id,
      processId: workerProcess.pid,
    });
  } catch (error: unknown) {
    console.error('Error triggering worker:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to trigger worker',
      },
      { status: 500 }
    );
  }
}

