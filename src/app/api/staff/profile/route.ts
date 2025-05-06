import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
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


export async function GET(request: NextRequest) {
  try {

    const TokenPayLoad = verifyToken(request);
    const UserId = TokenPayLoad?.id;

    if (!TokenPayLoad) {
      return NextResponse.json(
        {
          message: "Authorization is required",
        },
        { status: 401 }
      );
    }


    if (!UserId) {
      return NextResponse.json(
        { message: "UserId is required.", UserId },
        { status: 400 }
      );
    }

    

    // Query the user by email
    const user = await User.findById( UserId );

    if (!user) {
      return NextResponse.json(
        { message: `User  with userId: ${UserId} not found.`, user },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json(
      {
        message: "Error retrieving user",
      },
      { status: 500 }
    );
  }
}


// Delete user account
export async function DELETE(request: NextRequest) {
  try {
     const TokenPayLoad = verifyToken(request);
     const userId = TokenPayLoad?.id;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Authorization Is Required",
        },
        { status: 401 }
      );
    }

   

 

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User account deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error },
      { status: 500 }
    );
  }
}



// interface ImageUploadResponse {
//   secure_url: string;
//   public_id: string;
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     // Verify token and extract user data
//     const TokenPayLoad = verifyToken(request);
//     const userId = TokenPayLoad?.id;
    

//     if (!TokenPayLoad) {
//       return NextResponse.json(
//         {
//           message: "Authorization is required",
//         },
//         { status: 401 }
//       );
//     }

   


//     console.log(userId)

//     // Validate user ID and email
//     if (!userId) {
//       return NextResponse.json(
//         { message: "User ID is required." },
//         { status: 400 }
//       );
//     }

   

//     // Validate email format
    
//     const user = await User.findById(userId);
//     if (!user) {
//       return NextResponse.json({ message: "User not found." }, { status: 404 });
//     }

//     // Parse form data for image and other inputs
//     const formData = await request.formData();
//     const image = formData.get("image") as unknown as File;
//     const name = formData.get("name") as string; // Ensure name comes from formData, not JSON
//     const name = formData.get("isOnHoliday") as string; // Ensure name comes from formData, not JSON
//     const name = formData.get("workingHours") as string; // Ensure name comes from formData, not JSON

//     // Validate image
//     if (image) {
//       const fileSize = image.size;
//       const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB file size limit
//       if (fileSize > MAX_FILE_SIZE) {
//         return NextResponse.json(
//           {
//             error: `File size too large. Got ${fileSize}. Maximum is ${MAX_FILE_SIZE}.`,
//           },
//           { status: 413 }
//         );
//       }

//       // Check if user has an existing image and delete it if necessary
//       if (user.public_id) {
//         console.log("Deleting existing image with public_id:", user.public_id);
//         await DeleteImage(user.public_id);
//       }

//       // Upload new image to Cloudinary
//       const data = (await UploadImage(
//         image,
//         "EpicHair-userprofile-gallery"
//       )) as ImageUploadResponse;

//       if (!data) {
//         return NextResponse.json(
//           { error: "Failed to upload image" },
//           { status: 500 }
//         );
//       }

//       // Update user's image_url and public_id with new image data
//       user.image_url = data.secure_url;
//       user.public_id = data.public_id;
//     }


//     // Validate name
//     if (name) {
     
//       user.username = name; // Update the name
//     }

//     // Find user by ID
    
//     user.isOnHoliday = isOnHoliday;
//     user.workingHours = workingHours;
    

//     // Save updated user details
//     await user.save();

//     return NextResponse.json(
//       {
//         message: "User information updated successfully.",
//         // user: {
//         //   email: user.email,
//         //   name: user.username,
//         //   image_url: user.image_url,
//         // },
//         user,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return NextResponse.json(
//       { message: "Error updating user", error },
//       { status: 500 }
//     );
//   }
// }




interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}

export async function PATCH(request: NextRequest) {
  try {
    const tokenPayload = verifyToken(request);
    const userId = tokenPayload?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "Authorization is required" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const image = formData.get("image") as unknown as File;
    const username = formData.get("username") as string;
    const isOnHolidayRaw = formData.get("isOnHoliday") as string;
    const workingHoursRaw = formData.get("workingHours") as string;

    // Convert isOnHoliday to boolean
    const isOnHoliday = isOnHolidayRaw === "true";

    // Parse workingHours from stringified JSON
    let workingHours;
    try {
      workingHours = JSON.parse(workingHoursRaw || "{}");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid workingHours format" },
        { status: 400 }
      );
    }

    if (image) {
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image file too large (max 2MB)" },
          { status: 413 }
        );
      }

      if (user.public_id) {
        await DeleteImage(user.public_id);
      }

      const uploadResult = (await UploadImage(image, "EpicHair-userprofile-gallery")) as ImageUploadResponse;

      if (!uploadResult) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }

      user.image_url = uploadResult.secure_url;
      user.public_id = uploadResult.public_id;
    }

    if (username) user.username = username;
    if (typeof isOnHoliday === "boolean") user.isOnHoliday = isOnHoliday;
    if (workingHours?.start && workingHours?.end) user.workingHours = workingHours;

    await user.save();

    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Server error while updating user", error },
      { status: 500 }
    );
  }
}
