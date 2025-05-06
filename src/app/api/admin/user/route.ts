import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import db from "@/utils/db";
import jwt from "jsonwebtoken";

db();
const verifyToken = (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization");
  let token: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = request.cookies.get("token")?.value || null;
  }

  if (!token) {
    console.warn("No authorization token found.");
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET || "default_secret_key"
    );

    if (typeof decoded !== "string") {
      return decoded; // Return the decoded JWT payload (full info)
    } else {
      throw new Error("Invalid token payload.");
    }
  } catch (error) {
    console.error("Token verification error:", { cause: error });
    return null;
  }
};



export async function GET(request: NextRequest) {
  // Verify the token before proceeding
  const userData = verifyToken(request);

  if (!userData) {
    return NextResponse.json(
      { message: "Unauthorized access. Invalid or missing token." },
      { status: 401 }
    );
  }

  try {
    // Query to get all users with role 'staff'
    const Users = await User.find({ role: "user" });

    return NextResponse.json({User: Users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff users:", error);
    return NextResponse.json(
      { message: "Error fetching staff users", error },
      { status: 500 }
    );
  }
}



export async function DELETE(request: NextRequest) {
  // Verify the token before proceeding
  const userData = verifyToken(request);

  if (!userData) {
    return NextResponse.json(
      { message: "Unauthorized access. Invalid or missing token." },
      { status: 401 }
    );
  }

  // Only allow admins to delete users
  if (userData.role !== "admin") {
    return NextResponse.json(
      { message: "Unauthorized access. Admin privileges required." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Find and delete the user with the provided ID
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error },
      { status: 500 }
    );
  }
}
