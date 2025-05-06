import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import db from "@/utils/db";
import bcrypt from "bcryptjs";
import { DeleteImage } from "@/lib/upload-Image";

// Establish DB connection
db();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber, otp } = body;

  // Validate inputs
  if (!phoneNumber || !otp) {
    return NextResponse.json(
      { message: "Phone number and OTP are required." },
      { status: 400 }
    );
  }

  try {
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if OTP and expiry are present
    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json(
        { message: "OTP is not available or has expired." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    const otpExpiryDate = new Date(user.otpExpiry);
    console.log("expiray Time:", otpExpiryDate);
    console.log("Current Time:", new Date().toLocaleString());
    console.log("OTP Expiry Date:", otpExpiryDate.toLocaleString());

    if (Date.now() > otpExpiryDate.getTime()) {
      return NextResponse.json(
        { message: "OTP has expired." },
        { status: 400 }
      );
    }

    // Validate the OTP
    const isOtpValid = await bcrypt.compare(otp.trim(), user.otp);
    if (!isOtpValid) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    // Proceed to delete image and user (as per the previous logic)
    if (user.public_id) {
      console.log("Deleting existing image with public_id:", user.public_id);
      await DeleteImage(user.public_id);
      
    }

    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      return NextResponse.json(
        { message: "User account deletion failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User account deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Error verifying OTP." },
      { status: 500 }
    );
  }
}
