import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import Appointment from "@/models/Appointment";
// import { verifyToken } from "@/utils/Token";
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


export async function PUT(request: NextRequest) {
  try {


      // const tokenId = verifyToken(request);
      const TokenPayLoad = verifyToken(request);
      const tokenId = TokenPayLoad?.id;
     console.log(tokenId);

     if (!tokenId) {
       return NextResponse.json(
         {
           message: "Authorization required to Update an appointment Feedback.",
         },
         { status: 401 }
       );
     }


    const { appointmentId, userId, feedback, rating } = await request.json();




    if (!appointmentId || !userId) {
      return NextResponse.json(
        { error: "Appointment ID and User ID are required." },
        { status: 400 }
      );
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or does not belong to the user." },
        { status: 404 }
      );
    }

    appointment.feedback = feedback;
    appointment.rating = rating;

    await appointment.save();

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error("Error while updating feedback and rating:", error);
    return NextResponse.json(
      { error: "Failed to update feedback and rating." },
      { status: 500 }
    );
  }
}

// Retrieve full appointment details including feedback and rating
export async function GET(request: NextRequest) {
  try {


    // const tokenId = verifyToken(request);
      const TokenPayLoad = verifyToken(request);
      const tokenId = TokenPayLoad?.id;
    console.log(tokenId);
    console.log(TokenPayLoad);

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
    if (!appointmentId || !tokenId) {
      return NextResponse.json(
        { error: "Appointment ID and User ID are required." },
        { status: 400 }
      );
    }

    // Find the appointment by ID and user ID
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: tokenId,
    })
      .populate("barber") // Assuming you want to fetch barber details as well
      .populate("user") // Assuming you want to fetch user details as well
      .select(
        "service appointmentDate appointmentTime feedback rating barber user"
      );

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or does not belong to the user." },
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



export async function DELETE(request: NextRequest) {
  try {

     const TokenPayLoad = verifyToken(request);
     const tokenId = TokenPayLoad?.id;

    //  const tokenId = verifyToken(request);
    console.log(tokenId);


    if (!tokenId) {
      return NextResponse.json(
        {
          message: "Authorization required to Delete an appointment Feedback.",
        },
        { status: 401 }
      );
    }

    const { appointmentId, userId } = await request.json();

    
    if (!appointmentId || !userId) {
      return NextResponse.json(
        { error: "Appointment ID and User ID are required." },
        { status: 400 }
      );
    }

    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: userId,
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or does not belong to the user." },
        { status: 404 }
      );
    }

    
    appointment.feedback = null;
    appointment.rating = null;

    
    await appointment.save();

    return NextResponse.json(
      { message: "Feedback and rating deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while deleting feedback and rating:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback and rating." },
      { status: 500 }
    );
  }
}
