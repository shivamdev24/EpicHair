import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Establish DB connection
db();

export async function POST(request: NextRequest) {
  // Extract phone number from URL search parameters
  const body = await request.json();
  const { phoneNumber, otp } = body;
  if (!phoneNumber || !otp) {
    return NextResponse.json(
      { message: "Phone number and otp is required." },
      { status: 400 }
    );
  }

  try {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    console.log("User are in db or not:", user);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if OTP exists and hasn't expired
    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { message: "OTP is not available or expired." },
        { status: 400 }
      );
    }

    // Convert otpExpiry to Date object
    const otpExpiryDate = new Date(user.otpExpiry);
    console.log("OTP Expiry Date:", otpExpiryDate);

    // Check if OTP has expired
    const isOtpExpired = Date.now() > otpExpiryDate.getTime();
    if (isOtpExpired) {
      return NextResponse.json(
        { message: "OTP has expired." },
        { status: 400 }
      );
    }

    // Compare entered OTP with stored OTP
    const isOtpValid = await bcrypt.compare(otp.trim(), user.otp);
    if (!isOtpValid) {
      return NextResponse.json({ message: "OTP is invalid." }, { status: 400 });
    }

    // Mark user as verified and save
    user.isVerified = true;
    await user.save();

    // Create JWT token
    const tokenSecret = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
      return NextResponse.json(
        { message: "Internal Server Error." },
        { status: 500 }
      );
    }

    const tokenData = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
      isTemp: user.isTemp,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!);

    const response = NextResponse.json(
      { message: "User verified successfully.", tokenData, token },
      { status: 200 }
    );

    // Set the JWT token in a secure cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Error verifying OTP." },
      { status: 500 }
    );
  }
}
