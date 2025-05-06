











import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "@/utils/db";

db();

export async function POST(request: NextRequest) {
  const { phoneNumber, otp } = await request.json();

  // Check required fields
  if (!phoneNumber || !otp) {
    return NextResponse.json(
      { message: "phoneNumber and OTP are required." },
      { status: 400 }
    );
  }

  try {
    // Optimize by selecting only the required fields
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

     if (user.isTemp) {
       if (otp === user.otp) {
         // Generate JWT token for temporary users
         const tokenData = {
           id: user._id,
           phoneNumber: user.phoneNumber,
           role: user.role,
           isTemp: user.isTemp
         };
         const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!);

         const response = NextResponse.json(
           {
             message: "User is verified and temporary. Logged in successfully.",
             tokenData,
             token,

           },
           { status: 200 }
         );

         // Set cookie for temporary user login
         response.cookies.set("token", token, {
           httpOnly: true,
           secure: process.env.NODE_ENV === "production",
           sameSite: "strict",
         });

         return response;
       } else {
         return NextResponse.json({ message: "Invalid OTP." }, { status: 401 });
       }
     }else{
       // Check OTP expiry
       if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
         return NextResponse.json(
           { message: "OTP has expired." },
           { status: 401 }
         );
       }

       // Check if OTP is available
       if (!user.otp) {
         return NextResponse.json(
           { message: "OTP is not available." },
           { status: 400 }
         );
       }

       // Verify OTP
       const isOtpValid = await bcrypt.compare(otp, user.otp);
       if (!isOtpValid) {
         return NextResponse.json({ message: "Invalid OTP." }, { status: 401 });
       }

       // If the user is already verified
       if (!user.isVerified) {
         user.isVerified = true;
         await user.save();
       }

       // Generate JWT token
       const tokenData = {
         id: user._id,
         phoneNumber: user.phoneNumber,
         role: user.role,
       };
       const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!);

       const response = NextResponse.json(
         {
           message: "User is Verified and Login successfully.",
           role: user.role,
           token,
         },
         { status: 200 }
       );

       // Set cookie
       response.cookies.set("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "strict",
       });

       return response;
     }
    

   
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}






