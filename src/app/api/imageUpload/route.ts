

import { UploadImage, DeleteImage } from "@/lib/upload-Image";
import User from "@/models/User";
import db from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

import jwt, { JwtPayload } from "jsonwebtoken";

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
      return decoded as JwtPayload; // Return the decoded JWT payload (full info)
    } else {
      throw new Error("Invalid token payload.");
    }
  } catch (error) {
    console.error("Token verification error:", { cause: error });
    return null;
  }
};

interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}

export async function PATCH(req: NextRequest) {
  try {
    // Verify the JWT token
    const decodedToken = verifyToken(req);
    console.log("Decoded Token:", decodedToken); // Log the decoded token

    if (!decodedToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;
    console.log("User ID from Token:", userId); // Log the user ID

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: `User not found for ID: ${userId} : ${decodedToken.email}` },
        { status: 404 }
      );
    }

    // Parse the form data for the new image
    const formData = await req.formData();
    const image = formData.get("image") as unknown as File;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const fileSize = image.size; // Get file size
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB file size limit
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size too large. Got ${fileSize}. Maximum is ${MAX_FILE_SIZE}.`,
        },
        { status: 413 } // 413 Payload Too Large status code
      );
    }

    // Check if user has an existing image
    if (user.public_id) {
      console.log("Deleting existing image with public_id:", user.public_id);
      await DeleteImage(user.public_id); // Delete the old image if it exists
    }

    // Upload the new image to Cloudinary
    const data = (await UploadImage(
      image,
      "EpicHair-userprofile-gallery"
    )) as ImageUploadResponse;

    if (!data) {
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Update user's image_url and public_id with new image data
    user.image_url = data.secure_url;
    user.public_id = data.public_id;

    // Save the updated user details
    await user.save();

    return NextResponse.json(
      { message: "Image uploaded and updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
