

import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/utils/Sms"; // Use Twilio's SMS function
import User from "@/models/User";
import db from "@/utils/db";
import { generateOtp, getOtpExpiry } from "@/utils/OtpGenerate";
import bcrypt from "bcryptjs";

db();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber } = body;

  if (!phoneNumber ) {
    return NextResponse.json(
      { message: "Phone number is required." },
      { status: 400 }
    );
  }

  try {
    const existingUser = await User.findOne({ phoneNumber });
    console.log("existingUser staff", existingUser);

    if (existingUser) {
      // Check if user is verified
      if (existingUser.isVerified) {
        return NextResponse.json(
          { message: "Staff already exists and is verified." },
          { status: 400 }
        );
      } else {
        // User exists but is not verified, generate a new OTP
        const otp = generateOtp();
        // const hashedPassword = await bcrypt.hash(password, 10);
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpiry = getOtpExpiry(10);

        const userInfo = await User.findOneAndDelete(phoneNumber, {
          otp: hashedOtp,
          // password: hashedPassword,
          otpExpiry,
        });
         await sendOTP({
          phoneNumber,
          otp,
          smsType: "SIGNUP OTP",
        });

        return NextResponse.json(
          {
            message:
              "Staff exists but is not verified. A new verification SMS has been sent.",
            userInfo,
          },
          { status: 200 }
        );
      }
    } else {
      // User does not exist, create a new one
      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpiry = getOtpExpiry(10);

      // const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        phoneNumber: phoneNumber,
        role: "staff", // Set the required role field
        otp: hashedOtp,
        // password: hashedPassword,
        otpExpiry,
      });

      const newUserIfno = await newUser.save();

       return NextResponse.json(
         { message: "OTP sent successfully to your phone!", newUserIfno },
         { status: 201 }
       );
    }
  } catch (error) {
    console.error("Error signing up staff:", error);
    return NextResponse.json(
      { message: "Error signing up staff", error },
      { status: 500 }
    );
  }
}