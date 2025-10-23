import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// POST login user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Remove password from response
    const userObject = user.toObject();
    delete userObject.password;

    // In a production app, you would create a JWT token here
    // For now, we'll return the user data and let the client store it
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: userObject,
      },
    });
  } catch (error: any) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Login failed" },
      { status: 500 }
    );
  }
}

