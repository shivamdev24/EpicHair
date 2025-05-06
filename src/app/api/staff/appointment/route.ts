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
    }
  } catch (error) {
    throw new Error("Invalid token.", { cause: error });
  }
};





export async function GET(request: NextRequest) {
  try {
    const TokenPayLoad = verifyToken(request);
    const userId = TokenPayLoad?.id;

    console.log("User  ID from token:", userId);
    console.log("Token Payload:", TokenPayLoad);

    if (!TokenPayLoad) {
      return NextResponse.json(
        { message: "Authorization required to fetch appointments." },
        { status: 401 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { message: "userId required to fetch appointments." },
        { status: 401 }
      );
    }

    const appointments = await Appointment.find({ barber: userId })
      .populate("barber")
      .populate("service")
      .populate("user");

    console.log("Appointments for user:", appointments);

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(
        { message: "No appointments found for this user." },
        { status: 404 }
      );
    }

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("Error while fetching appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments.", error},
      { status: 500 }
    );
  }
}



















// Update an appointment status pending to cancle by user using ID
export async function PUT(request: NextRequest) {
  try {
    const { _id, status, service, appointmentDate, appointmentTime } =
      await request.json();
      const userId = verifyToken(request);
      // const userId = TokenPayLoad.id;
    console.log(userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Authorization required to Update an appointment." },
        { status: 401 }
      );
    }

    const appointment = await Appointment.findById(_id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      _id,
      { status, service, appointmentDate, appointmentTime },
      { new: true }
    );
    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error("Error while updating appointment:", error);
    return NextResponse.json(
      { message: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

