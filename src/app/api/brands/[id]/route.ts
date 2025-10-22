import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Brand from '@/models/Brand';

// DELETE a brand by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: 'Brand not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete brand',
      },
      { status: 500 }
    );
  }
}

// PUT update a brand by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
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

    const brand = await Brand.findByIdAndUpdate(
      id,
      {
        brandName,
        sellerCentralAccountId,
        brandUrl,
      },
      { new: true, runValidators: true }
    ).populate('sellerCentralAccountId', 'accountName');

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: 'Brand not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error: unknown) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update brand',
      },
      { status: 500 }
    );
  }
}

