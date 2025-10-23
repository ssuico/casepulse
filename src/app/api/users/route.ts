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
    const { email, password, role, firstName, lastName, phone } = body;

    console.log("Received user data:", { email, role, firstName, lastName, phone });

    // Validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
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

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    const userData: any = {
      email: email.toLowerCase(),
      password,
      role,
    };

    // Only add optional fields if they have values
    if (firstName && firstName.trim()) userData.firstName = firstName.trim();
    if (lastName && lastName.trim()) userData.lastName = lastName.trim();
    if (phone && phone.trim()) userData.phone = phone.trim();

    console.log("Creating user with data:", userData);

    const user = await User.create(userData);

    console.log("User created successfully:", user.toObject());

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

