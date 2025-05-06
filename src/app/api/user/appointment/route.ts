

import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import User from "@/models/User";

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
    //  const userId = verifyToken(request);
    console.log("User ID from token:", userId);
    console.log("User ID from token:", TokenPayLoad);

    if (!userId) {
      return NextResponse.json(
        { message: "Authorization required to fetch appointments." },
        { status: 401 }
      );
    }

   
       const appointments = await Appointment.find({ user: userId })
         .populate("barber")
         .populate("service")
         .populate("user");

       if (!appointments || appointments.length === 0) {
         return NextResponse.json(
           { message: "No appointments found for this user." },
           { status: 404 }
         );
       }

    // console.log(appointments);

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("Error while fetching appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}






export async function POST(request: NextRequest) {
  try {
    const { service, appointmentDate, appointmentTime, barberId } =
      await request.json();

    // Verify token and extract the user ID
    //  const userId = verifyToken(request);
    const TokenPayload = verifyToken(request);
    const userId = TokenPayload?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Authorization required to create an appointment." },
        { status: 401 }
      );
    }

    // Convert time string "HH:MM" to minutes
    const convertTimeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Get current date and time for validation
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    const currentTimeInMinutes =
      currentDate.getHours() * 60 + currentDate.getMinutes();

    // Check if the appointment date is in the past
    if (appointmentDate < currentDateString) {
      return NextResponse.json(
        { message: "Cannot create an appointment for a past date." },
        { status: 400 }
      );
    }

    // If the appointment date is today, check if the appointment time is in the past
    if (appointmentDate === currentDateString) {
      const requestedTimeInMinutes = convertTimeToMinutes(appointmentTime);
      if (requestedTimeInMinutes < currentTimeInMinutes) {
        return NextResponse.json(
          { message: "Cannot create an appointment for a past time." },
          { status: 400 }
        );
      }
    }

    // Check if barber exists
    const barber = await User.findById(barberId);
    if (!barber) {
      return NextResponse.json(
        { message: "Barber not found." },
        { status: 404 }
      );
    }

    // Check if service exists
    const serviceModel = await Service.findById(service);
    if (!serviceModel) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    const serviceDurationInMinutes = serviceModel.duration;

    // Find existing appointments for the barber on the requested date
    const existingAppointments = await Appointment.find({
      barber: barberId,
      appointmentDate,
    });

    const requestedTimeInMinutes = convertTimeToMinutes(appointmentTime);

    // Check if the requested time is already occupied
    const isTimeOccupied = existingAppointments.some((appointment) => {
      const appointmentTimeInMinutes = convertTimeToMinutes(
        appointment.appointmentTime
      );
      const appointmentEndInMinutes =
        appointmentTimeInMinutes + serviceDurationInMinutes;

      // Check for time overlap
      return (
        requestedTimeInMinutes >= appointmentTimeInMinutes &&
        requestedTimeInMinutes < appointmentEndInMinutes
      );
    });

    if (!isTimeOccupied) {
      // Create a new appointment since there's no conflict
      const newAppointment = new Appointment({
        barber: barberId,
        user: userId,
        service,
        appointmentDate,
        appointmentTime,
      });

      await newAppointment.save();

      return NextResponse.json(
        {
          message: "Appointment created successfully",
          appointment: newAppointment,
        },
        { status: 201 }
      );
    }

    // Handle time conflicts by calculating the next available time
    let nextAvailableTime = requestedTimeInMinutes;
    let hasPending = false;

    for (const appointment of existingAppointments) {
      const appointmentTimeInMinutes = convertTimeToMinutes(
        appointment.appointmentTime
      );

      if (appointment.status === "pending") {
        hasPending = true;
        nextAvailableTime = Math.max(
          nextAvailableTime,
          appointmentTimeInMinutes + serviceDurationInMinutes
        );
      } else if (appointment.status === "confirmed") {
        nextAvailableTime = Math.max(
          nextAvailableTime,
          appointmentTimeInMinutes + serviceDurationInMinutes
        );
      }
    }

    // Convert nextAvailableTime back to "HH:MM" format
    const nextAvailableHour = Math.floor(nextAvailableTime / 60);
    const nextAvailableMinute = nextAvailableTime % 60;
    const formattedNextAvailableTime = `${String(nextAvailableHour).padStart(
      2,
      "0"
    )}:${String(nextAvailableMinute).padStart(2, "0")}`;

    // Return response based on the conflict
    if (hasPending) {
      return NextResponse.json({
        existingAppointments,
        message:
          "There is a pending appointment at the selected time. Next available time:",
        nextAvailableTime: formattedNextAvailableTime,
      });
    } else {
      return NextResponse.json({
        existingAppointments,
        message:
          "There is a confirmed appointment at the selected time. Next available time:",
        nextAvailableTime: formattedNextAvailableTime,
      });
    }
  } catch (error) {
    console.error("Error while creating appointment:", error);
    return NextResponse.json(
      { message: "Failed to create appointment." },
      { status: 500 }
    );
  }
}






























export async function PUT(request: NextRequest) {
  try {
    const { _id, status, service, appointmentDate, appointmentTime } =
      await request.json();

    // Verify token and extract the user ID
    // const userId = verifyToken(request);
    const TokenPayLoad = verifyToken(request);
    const userId = TokenPayLoad?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Authorization required to update an appointment." },
        { status: 401 }
      );
    }

    // Check if the appointment exists
    const appointment = await Appointment.findById(_id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    // Convert time string "HH:MM" to minutes
    const convertTimeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Get current date and time for validation
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    const currentTimeInMinutes =
      currentDate.getHours() * 60 + currentDate.getMinutes();

    // Check if the appointment date is in the past
    if (appointmentDate < currentDateString) {
      return NextResponse.json(
        { message: "Cannot update to a past date." },
        { status: 400 }
      );
    }

    // If the appointment date is today, check if the appointment time is in the past
    if (appointmentDate === currentDateString) {
      const requestedTimeInMinutes = convertTimeToMinutes(appointmentTime);
      if (requestedTimeInMinutes < currentTimeInMinutes) {
        return NextResponse.json(
          { message: "Cannot update to a past time." },
          { status: 400 }
        );
      }
    }

    // Update the appointment
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

















// Delete an appointment by ID
export async function DELETE(request: NextRequest) {
  try {
    const { _id } = await request.json();
    
    //  const userId = verifyToken(request);
     const TokenPayLoad = verifyToken(request);
     const userId = TokenPayLoad?.id;
   console.log(userId);

   if (!userId) {
     return NextResponse.json(
       { message: "Authorization required to Delete an appointment." },
       { status: 401 }
     );
   }
    const deletedAppointment = await Appointment.findByIdAndDelete(_id);
    if (!deletedAppointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Appointment deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while deleting appointment:", error);
    return NextResponse.json(
      { message: "Failed to delete appointment." },
      { status: 500 }
    );
  }
}
