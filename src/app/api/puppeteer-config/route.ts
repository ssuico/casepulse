import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PuppeteerConfig from '@/models/PuppeteerConfig';

// GET - Fetch puppeteer configuration
export async function GET() {
  try {
    await connectDB();

    // Find or create config
    let config = await PuppeteerConfig.findOne();
    
    if (!config) {
      // Create default config if it doesn't exist
      config = await PuppeteerConfig.create({
        headless: true,
        timeout: 180000,
        sellerCentralUrl: 'https://sellercentral.amazon.com/home',
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: unknown) {
    console.error('Error fetching puppeteer config:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch config',
      },
      { status: 500 }
    );
  }
}

// PUT - Update puppeteer configuration
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { headless, timeout, sellerCentralUrl } = body;

    // Validate input
    if (typeof headless !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Headless must be a boolean' },
        { status: 400 }
      );
    }

    if (typeof timeout !== 'number' || timeout < 0) {
      return NextResponse.json(
        { success: false, message: 'Timeout must be a positive number' },
        { status: 400 }
      );
    }

    if (!sellerCentralUrl || typeof sellerCentralUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Seller Central URL is required' },
        { status: 400 }
      );
    }

    // Find existing config or create new one
    let config = await PuppeteerConfig.findOne();

    if (config) {
      // Update existing config
      config.headless = headless;
      config.timeout = timeout;
      config.sellerCentralUrl = sellerCentralUrl;
      await config.save();
    } else {
      // Create new config
      config = await PuppeteerConfig.create({
        headless,
        timeout,
        sellerCentralUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      data: config,
    });
  } catch (error: unknown) {
    console.error('Error updating puppeteer config:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update config',
      },
      { status: 500 }
    );
  }
}

