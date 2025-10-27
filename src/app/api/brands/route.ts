import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';
import '@/models/Account'; // Ensure Account model is registered

// GET all brands
export async function GET() {
  try {
    await dbConnect();
    const brands = await Brand.find({})
      .populate('sellerCentralAccountId', 'accountName')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: brands,
    });
  } catch (error: unknown) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch brands',
      },
      { status: 500 }
    );
  }
}

// POST create a new brand
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { brandName, sellerCentralAccountId, brandUrl } = body;

    // Validate required fields
    if (!brandName || !sellerCentralAccountId || !brandUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
        },
        { status: 400 }
      );
    }

    // Create the brand
    const brand = await Brand.create({
      brandName,
      sellerCentralAccountId,
      brandUrl,
    });

    const populatedBrand = await Brand.findById(brand._id).populate('sellerCentralAccountId', 'accountName');

    return NextResponse.json(
      {
        success: true,
        data: populatedBrand,
        message: 'Brand created successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create brand',
      },
      { status: 500 }
    );
  }
}

