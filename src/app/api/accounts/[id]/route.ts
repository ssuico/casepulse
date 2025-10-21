import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';
import mongoose from 'mongoose';

// GET single account with credentials (for worker use)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid account ID',
        },
        { status: 400 }
      );
    }

    const account = await Account.findById(id).select('+password +twoFAKey');

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account not found',
        },
        { status: 404 }
      );
    }

    // Return account with credentials for worker
    return NextResponse.json({
      success: true,
      data: {
        _id: account._id,
        accountName: account.accountName,
        username: account.username,
        password: account.password, // Hashed
        twoFAKey: account.twoFAKey, // Hashed
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch account',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid account ID',
        },
        { status: 400 }
      );
    }

    const account = await Account.findByIdAndDelete(id);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: unknown) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete account',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT update account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid account ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { accountName, username, password, twoFAKey } = body;

    const updateData: {
      accountName?: string;
      username?: string;
      password?: string;
      twoFAKey?: string;
    } = {};

    if (accountName) updateData.accountName = accountName;
    if (username) updateData.username = username;
    if (password) updateData.password = password;
    if (twoFAKey) updateData.twoFAKey = twoFAKey;

    const account = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('accountName username createdAt updatedAt');

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      data: account,
    });
  } catch (error: unknown) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update account',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

