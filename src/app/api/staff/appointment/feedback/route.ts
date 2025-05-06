import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import Appointment from "@/models/Appointment";
import { verifyToken } from "@/utils/Token";

db();





// Retrieve full appointment details including feedback and rating
export async function GET(request: NextRequest) {
  try {

      const tokenId = verifyToken(request);
      // const barberId = tokenId?.id;
    console.log(tokenId);

    if (!tokenId) {
      return NextResponse.json(
        {
          message: "Authorization required to Get an appointment Feedback.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    // Validate inputs
    if (!appointmentId ) {
      return NextResponse.json(
        { error: "Appointment ID and User ID are required." },
        { status: 400 }
      );
    }

    // Find the appointment by ID and user ID
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      // barber: barberId,
    })
      // .populate("barber") // Assuming you want to fetch barber details as well
      // .populate("user") // Assuming you want to fetch user details as well
      // .select("service ");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or does not belong to the Barber." },
        { status: 404 }
      );
    }

    // Return the full appointment details
    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("Error while fetching feedback and rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback and rating." },
      { status: 500 }
    );
  }
}


