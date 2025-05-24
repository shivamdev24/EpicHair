



import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
// import Appointment from "@/models/Appointment";
import Appointment from "@/models/Appointment";
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
    const user = await User.findById(UserId);

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














interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}



function getAllTargetDates(days = 7): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]); // "YYYY-MM-DD"
  }
  return dates;
}

type Appointment = {
  date: string; // "YYYY-MM-DD"
  start: string; // "HH:mm"
  end: string; // "HH:mm"
};



export async function PATCH(request: NextRequest) {
  try {
    const tokenPayload = verifyToken(request);
    if (!tokenPayload?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = tokenPayload.id;
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const image = formData.get("image") as unknown as File;
    const username = formData.get("username") as string;
    const isOnHolidayRaw = formData.get("isOnHoliday") as string;
    const workingHoursRaw = formData.get("workingHours") as string;
    const availableHoursRaw = formData.get("availableHours") as string;
    const customAvailableRaw = formData.get("customAvailable") as string; 

    const isOnHoliday = isOnHolidayRaw === "true";

    let workingHours, availableHours, customAvailable;
    try {
      workingHours = JSON.parse(workingHoursRaw || "{}");
      availableHours = JSON.parse(availableHoursRaw || "{}");
      customAvailable = JSON.parse(customAvailableRaw || "{}");
      console.log("Parsed customAvailable:", customAvailable);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid JSON format", err },
        { status: 400 }
      );
    }

   
    if (image) {
      const MAX_SIZE = 4 * 1024 * 1024;
      if (image.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Image too large (max 4MB)" },
          { status: 413 }
        );
      }

      if (user.public_id) await DeleteImage(user.public_id);

      const uploaded = (await UploadImage(
        image,
        "EpicHair-userprofile-gallery"
      )) as ImageUploadResponse;
      if (!uploaded)
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );

      user.image_url = uploaded.secure_url;
      user.public_id = uploaded.public_id;
    }

    
    if (username) user.username = username;
    user.isOnHoliday = isOnHoliday;

    if (workingHours?.start && workingHours?.end) {
      user.workingHours = workingHours;
    }

    if (availableHours?.start && availableHours?.end) {
      user.availableHours = workingHours;
    }

   
    if (customAvailableRaw) {
      let customAvailableArray;
      try {
        customAvailableArray = JSON.parse(customAvailableRaw);
      } catch {
        return NextResponse.json(
          { message: "Invalid JSON for customAvailable" },
          { status: 400 }
        );
      }

      if (!Array.isArray(customAvailableArray)) {
        return NextResponse.json(
          { message: "customAvailable must be an array" },
          { status: 400 }
        );
      }


      for (const { date, start, end } of customAvailableArray) {
        if (!date || !start || !end) {
          return NextResponse.json(
            { message: "Each entry needs date, start, end" },
            { status: 400 }
          );
        }

        const appointmentExists = await Appointment.findOne({
          barber: userId,
          appointmentDate: date,
          appointmentTime: { $gte: start, $lt: end },
        });

        if (appointmentExists) {
          console.error(
            `Conflict detected: Appointment exists on ${date} at ${appointmentExists.appointmentTime}`
          );
          return NextResponse.json(
            {
              message: `Cannot update availability. Appointment exists on ${date} at ${appointmentExists.appointmentTime}. Cancel it first.`,
            },
            { status: 400 }
          );
        }
      }

      const allTargetDates = getAllTargetDates(); 

      const customMap = new Map(
        customAvailableArray.map(({ date, start, end }) => [
          date,
          { start, end },
        ])
      );

      const updatedCustomHours = [];
    
      for (const date of allTargetDates) {
        let start: string, end: string;

        if (customMap.has(date)) {
          const custom = customMap.get(date)!;
          start = custom.start;
          end = custom.end;
        } else {
          start = user.workingHours.start;
          end = user.workingHours.end;
        }

        
        console.log(`Processing date: ${date}, start: ${start}, end: ${end}`);
        
        

        updatedCustomHours.push({ date, start, end });
      }

      user.customAvailableHours = updatedCustomHours;
    }

   

    await user.save();

    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error },
      { status: 500 }
    );
  }
}