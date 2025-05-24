import { NextRequest, NextResponse } from "next/server";
import Offer from "@/models/Offer";
import db from "@/utils/db";
import { DeleteImage, UploadImage } from "@/lib/upload-Image";
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
    throw new Error("Authorization token is required.");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET || "default_secret_key"
    );

    if (typeof decoded !== "string") {
      return decoded as JwtPayload;
    }
  } catch (error) {
    throw new Error("Invalid token.", { cause: error });
  }
};

export async function GET() {
  try {
    
    const offer = await Offer.find();

    if (offer && offer.length === 0) {
      return NextResponse.json(
        { message: "No offers found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        offer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving offer:", error);
    return NextResponse.json(
      {
        message: "Error retrieving offer",
      },
      { status: 500 }
    );
  }
}

// Delete user account
export async function DELETE(request: NextRequest) {
  try {
    const tokenPayload = verifyToken(request);
    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Offer ID is required" },
        { status: 400 }
      );
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json(
        { message: "Offer not found." },
        { status: 404 }
      );
    }

    if (offer.public_id) await DeleteImage(offer.public_id);
      
      await Offer.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Offer deleted successfully.", offer },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { message: "Error deleting offer", error },
      { status: 500 }
    );
  }
}


interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}




export async function POST(request: NextRequest) {
  try {

    const tokenPayload = verifyToken(request);
    if (!tokenPayload) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const image = formData.get("image") as unknown as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const discountPercentage = Number(formData.get("discountPercentage"));
    const validFrom = new Date(formData.get("validFrom") as string);
    const validTo = new Date(formData.get("validTo") as string);
    const isActive = formData.get("isActive") === "true";

    if (!title || !description || isNaN(discountPercentage)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let offerImageUrl = "";
    let public_id = "";

    if (image) {
      const MAX_SIZE = 4 * 1024 * 1024;
      if (image.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Image too large (max 4MB)" },
          { status: 413 }
        );
      }

      const uploaded = (await UploadImage(
        image,
        "EpicHair-offer-gallery"
      )) as ImageUploadResponse;
      if (!uploaded) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }

      offerImageUrl = uploaded.secure_url;
      public_id = uploaded.public_id;
    }

    const newOffer = await Offer.create({
      title,
      description,
      discountPercentage,
      validFrom,
      validTo,
      isActive,
      offerImageUrl,
      public_id,
    });

    return NextResponse.json(
      { message: "Offer created successfully", offer: newOffer },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/offers error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}
