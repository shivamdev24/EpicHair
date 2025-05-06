

import { NextRequest, NextResponse } from "next/server";
import Reminder from "@/models/Reminder";
import db from "@/utils/db";
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
     const userId = TokenPayLoad?.id;

    // Fetch all reminders associated with the user
    const reminders = await Reminder.find({ userId });

    return NextResponse.json(reminders, { status: 200 });
  } catch (error) {
    console.error("Error retrieving reminders:", error);
    return NextResponse.json(
      { message: "Failed to fetch reminders." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const TokenPayLoad = verifyToken(request);
    const userId = TokenPayLoad?.id; // Get user ID from token

    const { title, date, message } = await request.json();

    // Validate input
    if (!title || !date || !message) {
      return NextResponse.json(
        { error: "Title, date, and message are required." },
        { status: 400 }
      );
    }

    const newReminder = new Reminder({
      title,
      date,
      message,
      userId, // Use userId from the decoded token
    });
    await newReminder.save();

    return NextResponse.json(newReminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json(
      { error: "Failed to create reminder." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const TokenPayLoad = verifyToken(request);
    const userId = TokenPayLoad?.id; // Get user ID from token

    const { _id, title, date, message } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "Reminder ID is required." },
        { status: 400 }
      );
    }

    const reminder = await Reminder.findById(_id);
    if (!reminder) {
      return NextResponse.json(
        { error: "Reminder not found." },
        { status: 404 }
      );
    }

    // Ensure the reminder belongs to the user
    if (reminder.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this reminder." },
        { status: 403 }
      );
    }

    // Update reminder fields
    if (title) reminder.title = title;
    if (date) reminder.date = date;
    if (message) reminder.message = message;

    await reminder.save(); // Save updated reminder

    return NextResponse.json(reminder, { status: 200 });
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { message: "Failed to update reminder." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
   
    const { _id } = await request.json();
    await Reminder.findByIdAndDelete(_id);
    return NextResponse.json({ message: "Reminder deleted." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return NextResponse.json({ error }, { status: 401 });
  }
}
