import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Account from '@/models/Account';

// GET all accounts (without sensitive data)
export async function GET() {
  try {
    await connectDB();

    const accounts = await Account.find()
      .select('accountName username createdAt updatedAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error: unknown) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch accounts',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST create new account
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { accountName, username, password, twoFAKey } = body;

    // Validation
    if (!accountName || !username || !password || !twoFAKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required',
        },
        { status: 400 }
      );
    }

    // Check if account name already exists
    const existingAccount = await Account.findOne({ accountName });
    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account name already exists',
        },
        { status: 409 }
      );
    }

    // Create new account (password and 2FA key will be ENCRYPTED automatically by the model)
    // The mongoose pre-save hook will encrypt these fields using AES-256-GCM
    const account = await Account.create({
      accountName,
      username,
      password,
      twoFAKey,
    });

    // Return account without sensitive data
    const accountData = {
      _id: account._id,
      accountName: account.accountName,
      username: account.username,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: accountData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create account',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

