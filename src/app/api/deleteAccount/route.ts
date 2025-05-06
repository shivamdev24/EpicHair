import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/utils/Sms"; // Use Twilio's SMS function
import User from "@/models/User";
import db from "@/utils/db";
import { generateOtp, getOtpExpiry } from "@/utils/OtpGenerate";
import bcrypt from "bcryptjs";

// Establish DB connection
db();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber } = body;

  // Validate inputs
  if (!phoneNumber ) {
    return NextResponse.json(
      { message: "Phone number and role are required." },
      { status: 400 }
    );
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    console.log("Existing User:", existingUser);

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = getOtpExpiry(10); // 10 minutes expiry

    // Send OTP to the phone number
    

    if (existingUser) {
      // Update existing user with new OTP and expiry time
      existingUser.otp = hashedOtp;
      existingUser.otpExpiry = otpExpiry;
      // existingUser.role = role;

      const updatedUser = await existingUser.save();

      await sendOTP({
        phoneNumber,
        otp,
        smsType: "DELETE", // Assuming this is the type for account deletion
      });

      return NextResponse.json(
        {
          message: "Your Account Delete OTP sent successfully to your number!",
          updatedUser,
        },
        { status: 200 }
      );
    } else {

      return NextResponse.json(
        {
          message: "User Not Found for deletion",
          
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing OTP request", error },
      { status: 500 }
    );
  }
}
