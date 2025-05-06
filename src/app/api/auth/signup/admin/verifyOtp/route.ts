import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

db();

export async function POST(request: NextRequest) {


  const body = await request.json();
  const {  otp, phoneNumber } = body;

  try {
    const user = await User.findOne({ phoneNumber });
    console.log("User are in db or not:", user);

    if (!user) {
      return NextResponse.json({ message: "User not found.", user }, { status: 404 });
    }

   const hashedOtpdb = user.otp;
    if (!hashedOtpdb) {
      return NextResponse.json(
        { message: "OTP Invalid." },
        { status: 400 }
      );
    }


    
    
    
    const expiredOtp = user.otpExpiry;
    if (!expiredOtp) {
      return NextResponse.json(
        { message: "OTP expiry date is not available." },
        { status: 400 }
      );
    }

    // Compare the OTP with the hashed OTP stored in the database
    const isOtpValid = await bcrypt.compare(otp, hashedOtpdb);
    const isOtpExpired = Date.now() > expiredOtp.getTime();
    console.log(isOtpValid)

    // if (!isOtpValid) {
    //   return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    // }

    if (isOtpExpired) {
      return NextResponse.json(
        { message: "OTP has expired." },
        { status: 400 }
      );
    }

    // Mark user as verified and save
    user.isVerified = true;
    try {
      await user.save();
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { message: "Error updating user", error },
        { status: 500 }
      );
    }

    console.log("Signup successful");

    // Create a token for the user
    const tokenSecret = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
      console.error("TOKEN_SECRET environment variable is not set.");
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }

    try {
       const tokenData = {
         id: user._id,
         phoneNumber: user.phoneNumber,
         role: user.role,
       };
       const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!);

       const response = NextResponse.json(
         { message: "Signup successful.", role: user.role, token },
         { status: 200 }
       );

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

       return response;
    } catch (error) {
      console.error("Error creating token:", error);
      return NextResponse.json(
        { message: "Error creating token", error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Error verifying OTP", error },
      { status: 500 }
    );
  }
}

