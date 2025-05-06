

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import db from "@/utils/db";
import { generateOtp, getOtpExpiry } from "@/utils/OtpGenerate";
import bcrypt from "bcryptjs";
import { sendOTP } from "@/utils/Sms";

db();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber, password } = body;

  if (!phoneNumber || !password) {
    return NextResponse.json(
      { message: "Phone number and password are required." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { message: "Admin already exists and is verified." },
          { status: 400 }
        );
      } else {
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = getOtpExpiry(10);

        await User.findByIdAndUpdate(existingUser._id, {
          otp: hashedOtp,
          otpExpiry,
        });

        await sendOTP({
          phoneNumber,
          otp,
          smsType: "SIGNUP OTP",
        });

        return NextResponse.json(
          { message: "User exists but is not verified. OTP sent again." },
          { status: 200 }
        );
      }
    }

    const existingAdminCount = await User.countDocuments({ role: "admin" });
    if (existingAdminCount >= 3) {
      return NextResponse.json(
        { message: "Only two admins are allowed to register." },
        { status: 400 }
      );
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = getOtpExpiry(10);

    const newUser = new User({
      phoneNumber,
      role: "admin",
      otp: hashedOtp,
      password: hashedPassword,
      otpExpiry,
    });

    await newUser.save();

    await sendOTP({
      phoneNumber,
      otp,
      smsType: "SIGNUP OTP",
    });

    return NextResponse.json(
      { message: "OTP sent successfully to your phone number!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { message: "Error signing up user", error },
      { status: 500 }
    );
  }
}
