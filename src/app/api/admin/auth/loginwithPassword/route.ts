// app/api/admin/auth/loginwithPassword/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import db from "@/utils/db";

// Connect to the database
db();

// Handle POST request
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber, password } = body;

  if (!phoneNumber || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await User.findOne({ phoneNumber });
    console.log("admin info", existingUser  )

    if (!existingUser) {
      return NextResponse.json(
        { message: "Admin not Found!." },
        { status: 401 }
      );
    }

    const hashedPassword = existingUser.password;
    if (!hashedPassword) {
      return NextResponse.json(
        { message: "User password not found." },
        { status: 500 } // Internal Server Error
      );
    }

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid  password." },
        { status: 401 }
      );
    }

    if (!existingUser.isVerified) {
      return NextResponse.json(
        { message: "Admin is not verified. Please check your email." },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
        name: existingUser.username,
      },
      process.env.TOKEN_SECRET!,
      
    );

    const response = NextResponse.json(
      {
        message: "Login successful.",
        token,
      },
      { status: 200 }
    );

 
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    
    return response;
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json(
      { message: "Error logging in user", error },
      { status: 500 }
    );
  }
}
