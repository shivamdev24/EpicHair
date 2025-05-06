// Import necessary modules
import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import Appointment from "@/models/Appointment";
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
      throw new Error("Invalid token payload.");
    }
  } catch (error) {
    throw new Error("Invalid token.", { cause: error });
  }
};





// Fetch a specific appointment by ID
export async function GET(request: NextRequest) {
  try {
    // Verify user token
    const user = verifyToken(request);
    console.log(user);

    // Check if user is authenticated and is an admin
    if (!user ) {
      return NextResponse.json(
        { message: "Authorization required to GET an appointment." },
        { status: 401 }
      );
    }

    // Get appointment ID from the URL parameters
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("id");

    // Check if appointment ID is provided
    if (!appointmentId) {
      return NextResponse.json(
        { message: "Appointment ID is required." },
        { status: 400 }
      );
    }

    // Fetch the specific appointment from the database
    const appointment = await Appointment.findById(appointmentId)
      .populate("barber") // Populate barber details
      .populate("user"); // Populate user details

    // Check if appointment was found
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    // Return the specific appointment details
    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("Error while fetching the appointment:", error);
    return NextResponse.json(
      { message: "Failed to fetch the appointment." },
      { status: 500 }
    );
  }
}




