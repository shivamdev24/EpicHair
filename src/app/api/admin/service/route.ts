import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import Service from "@/models/Service";
import { DeleteImage, UploadImage } from "@/lib/upload-Image";
// import { DeleteImage } from "@/lib/upload-Image";

// Connect to the database
db();

const verifyToken = (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization");
  let token: string | null = null;

  // Check Authorization header first
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = request.cookies.get("token")?.value || null;
  }

  // Check if token is available
  if (!token) {
    throw new Error("Authorization token is required.");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET || "default_secret_key"
    );

    if (typeof decoded !== "string" && (decoded as JwtPayload).id) {
      return decoded; // Return the full decoded object
    } else {
      throw new Error("Invalid token payload.");
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token.", { cause: error });
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired.", { cause: error });
    } else {
      throw new Error("Token verification failed.", { cause: error });
    }
  }
};

// GET: Fetch all services
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Authorization required to access services." },
        { status: 401 }
      );
    }

    const services = await Service.find(); // Fetch all services
    console.log(services)
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services." },
      { status: 500 }
    );
  }
}










interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}

// POST: Create a new service
export async function POST(request: NextRequest) {
  try {
    // Verify user token
    const user = verifyToken(request);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Authorization required to create a service." },
        { status: 401 }
      );
    }

    // Parse form data for image and other inputs
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const duration = formData.get("duration") as string;
    const price = parseFloat(formData.get("price") as string); // Ensure price is a number

   

    // Initialize image-related variables
    let service_url: string | undefined;
    let public_id: string | undefined;

    if (image) {
      // Validate image size
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File size too large. Maximum is ${
              MAX_FILE_SIZE / 1024 / 1024
            } MB.`,
          },
          { status: 413 }
        );
      }

      // Upload new image to Cloudinary
      const uploadedImage = (await UploadImage(
        image,
        "EpicHair-service-gallery"
      )) as ImageUploadResponse;
      console.log("Uploaded image response:", uploadedImage);
      if (!uploadedImage) {
        return NextResponse.json(
          { error: "Failed to upload image." },
          { status: 500 }
        );
      }

      service_url = uploadedImage.secure_url;
      public_id = uploadedImage.public_id;
    }

    // Create a new service
    const newService = new Service({
      name,
      description,
      duration,
      price,
      service_url,
      public_id,
    });
    await newService.save();

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Failed to create service." },
      { status: 500 }
    );
  }
}





// PUT: Update an existing service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id?: string } } // Make id optional to prevent undefined access
) {
  try {
    // Verify user token
    const user = verifyToken(request);

    // Check if user is authenticated and is an admin
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Authorization required to update a service." },
        { status: 401 }
      );
    }

    // Parse request body
    const { name, description, price, duration } = await request.json();

    // Ensure id is defined
    if (!params.id) {
      return NextResponse.json(
        { message: "Service ID is required." },
        { status: 400 }
      );
    }

    // Update service by ID
    const updatedService = await Service.findByIdAndUpdate(
      params.id,
      { name, description, price, duration },
      { new: true } // Return the updated document
    );

    if (!updatedService) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedService, { status: 200 });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Failed to update service." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);

    // Check if user is authenticated and is an admin
    if (!user) {
      return NextResponse.json(
        { message: "Authorization required to delete a service." },
        { status: 401 }
      );
    }

    // Get the service ID from the query parameters
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Service ID is required." },
        { status: 400 }
      );
    }

    const deletedService = await Service.findById(id);
    console.log("deletedService", deletedService);
    // Check if user has an existing image
    if (deletedService.public_id) {
      console.log(
        "Deleting existing image with public_id:",
        deletedService.public_id
      );
      await DeleteImage(deletedService.public_id); // Delete the old image if it exists
    }

    // Delete service by ID
    const DeleteService = await Service.findByIdAndDelete(id);

    if (!DeleteService) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Service deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Failed to delete service." },
      { status: 500 }
    );
  }
}





