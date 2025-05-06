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

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id"); // Get the user ID from query parameters

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Query to find the specific user by ID
    const staffUser = await User.findById(userId); // Assuming User is a Mongoose model

    if (!staffUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ staff: staffUser }, { status: 200 });
  } catch (error) {
    console.error("Error fetching staff user:", error);
    return NextResponse.json(
      { message: "Error fetching staff user", error },
      { status: 500 }
    );
  }
}

