/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
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

type AppointmentSlot = {
  date: string;
  start: string;
  end: string;
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
    const customAvailableRaw = formData.get("customAvailable") as string;

    const isOnHoliday = isOnHolidayRaw === "true";

    let workingHours: { start: string; end: string } = { start: "", end: "" };
    let customAvailableArray: AppointmentSlot[] = [];

    try {
      if (workingHoursRaw) workingHours = JSON.parse(workingHoursRaw);
      if (customAvailableRaw)
        customAvailableArray = JSON.parse(customAvailableRaw);
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid JSON format", error: err },
        { status: 400 }
      );
    }

    // 🔄 Handle Image Upload
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

      if (!uploaded) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }

      user.image_url = uploaded.secure_url;
      user.public_id = uploaded.public_id;
    }

    // 🔄 Handle Profile Fields
    if (username) user.username = username;
    user.isOnHoliday = isOnHoliday;

    if (workingHours?.start && workingHours?.end) {
      user.workingHours = workingHours;
    }

    // Helper function to generate next 7 dates from today
    const generateNext7Dates = (): string[] => {
      const dates: string[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
      }
      
      return dates;
    };

    const generateDefaultWeek = (user: any, next7Dates: string[]) => {
      return next7Dates.map((date) => {
        const existingEntry = user.customAvailableHours?.find(
          (h: any) => h.date === date
        );
        return {
          date,
          start: existingEntry?.start || user.workingHours?.start || "09:00",
          end: existingEntry?.end || user.workingHours?.end || "17:00",
        };
      });
    };

    // 🔄 Handle Custom Available Hours
    if (Array.isArray(customAvailableArray)) {
      // Initialize customAvailableHours if it doesn't exist
      if (!user.customAvailableHours) {
        user.customAvailableHours = [];
      }

      const next7Dates = generateNext7Dates();
      const defaultWeek = generateDefaultWeek(user, next7Dates);

      // Check if all next 7 dates are already in customAvailableHours
      const allDatesPresent = next7Dates.every((date) =>
        user.customAvailableHours.some((h: any) => h.date === date)
      );

      if (!allDatesPresent) {
        // First-time or new week setup: fill all 7 days
        defaultWeek.forEach((defaultEntry) => {
          const newEntry = customAvailableArray.find(
            (entry) => entry.date === defaultEntry.date
          );
          const existingIndex = user.customAvailableHours.findIndex(
            (h: any) => h.date === defaultEntry.date
          );

         
          if (existingIndex !== -1) {
            // Update existing entry
            user.customAvailableHours[existingIndex].start =
              newEntry?.start || user.customAvailableHours[existingIndex].start;
            user.customAvailableHours[existingIndex].end =
              newEntry?.end || user.customAvailableHours[existingIndex].end;
          } else {
            // Add new entry
            user.customAvailableHours.push({
              date: defaultEntry.date,
              start: newEntry?.start || defaultEntry.start,
              end: newEntry?.end || defaultEntry.end,
            });
          }
        });
      } else {
        // Week already setup: update only provided dates

         // First, check for existing appointments once for all dates to avoid redundant queries inside the loop:
  for (const entry of customAvailableArray) {
    const existingAppointment = await Appointment.findOne({
      barber: user._id,
      appointmentDate: entry.date,
    });

    console.log(
      `Checking for existing appointment on ${entry.date}: ${existingAppointment ? "Found" : "Not Found"}` ) 

    if (existingAppointment) {
      return NextResponse.json(
        {
          message: `You have existing appointments on ${entry.date}. Please cancel them before updating availability.`,
        },
        { status: 400 }
      );
    }
  }

        for (const newEntry of customAvailableArray) {
          const existingIndex = user.customAvailableHours.findIndex(
            (h: any) => h.date === newEntry.date
          );

          for (const entry of customAvailableArray) {
            const existingAppointment = await Appointment.findOne({
              userId: user._id,
              date: entry.date,
            });

            if (existingAppointment) {
              return NextResponse.json(
                {
                  message: `You have existing appointments on ${entry.date}. Please cancel them before updating availability.`,
                },
                { status: 400 }
              );
            }
          }


          if (existingIndex !== -1) {
            user.customAvailableHours[existingIndex].start =
              newEntry.start || user.customAvailableHours[existingIndex].start;
            user.customAvailableHours[existingIndex].end =
              newEntry.end || user.customAvailableHours[existingIndex].end;
          } else {
            // Add new entry if it doesn't exist
            user.customAvailableHours.push({
              date: newEntry.date,
              start: newEntry.start || user.workingHours?.start || "09:00",
              end: newEntry.end || user.workingHours?.end || "17:00",
            });
          }
        }
      }
    }

    await user.save();

    return NextResponse.json(
      { message: "Profile updated successfully", user },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in PATCH /user:", err);
    return NextResponse.json(
      { message: "Internal server error", err },
      { status: 500 }
    );
  }
}