import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Password is excluded by default with select: false in schema
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT update user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { password, role } = body;

    // Build update object (username cannot be updated)
    const updateData: any = {};
    
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      // Hash the password before updating
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    if (role !== undefined) {
      if (!["manager", "user"].includes(role)) {
        return NextResponse.json(
          { success: false, message: "Role must be either 'manager' or 'user'" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

