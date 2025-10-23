import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET all users
export async function GET() {
  try {
    await connectDB();
    
    // Fetch all users (password is excluded by default with select: false in schema)
    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { username, password, role } = body;

    // Validation
    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Username, password, and role are required" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (!["manager", "user"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be either 'manager' or 'user'" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    const user = await User.create({
      username,
      password,
      role,
    });

    // Return user without password (password is excluded by default with select: false)
    const userObject = user.toObject();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: userObject,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

