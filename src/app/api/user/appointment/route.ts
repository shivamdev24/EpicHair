/* eslint-disable @typescript-eslint/no-explicit-any */

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
        // nextAvailableTime: formattedNextAvailableTime,
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
    // 🔑 Parse input
    const { _id, status, service, appointmentDate, appointmentTime } =
      await request.json();

    const tokenPayload = verifyToken(request);
    const userId = tokenPayload?.id;
    if (!userId) {
      return NextResponse.json(
        { message: "Authorization required." },
        { status: 401 }
      );
    }

    // 🔍 Fetch appointment
    const appointment = await Appointment.findById(_id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    // 🔍 Service lookup
    const serviceModel = await Service.findById(service);
    if (!serviceModel) {
      return NextResponse.json(
        { message: "Service not found." },
        { status: 404 }
      );
    }

    const serviceDuration = serviceModel.duration;

    // 🔍 Fetch barber
    const barber = await User.findById(appointment.barber);
    if (!barber) {
      return NextResponse.json(
        { message: "Barber not found." },
        { status: 404 }
      );
    }

    const conflictingHoliday = barber.holidayDates?.find(
      (range: { from: string; to: string }) =>
        appointmentDate >= range.from && appointmentDate <= range.to
    );

    if (barber.isOnHoliday || conflictingHoliday) {
      const holidayInfo = conflictingHoliday
        ? ` (${conflictingHoliday.from} to ${conflictingHoliday.to})`
        : "";

      return NextResponse.json(
        {
          message: `Barber is currently on holiday${holidayInfo}.`,
        },
        { status: 400 }
      );
    }
    // ⏳ Time conversion helpers
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // ❌ Prevent booking in the past
    if (
      appointmentDate < today ||
      (appointmentDate === today && toMinutes(appointmentTime) < nowMinutes)
    ) {
      return NextResponse.json(
        { message: "Cannot set appointment in the past." },
        { status: 400 }
      );
    }

    // ⏰ Get barber's working hours (custom or default)
    const customDay = barber.customAvailableHours?.find(
      (h: { date: string }) => h.date === appointmentDate
    );

const workingStart = toMinutes(
  customDay?.start || barber.workingHours?.start || "09:00"
);
const workingEnd = toMinutes(
  customDay?.end || barber.workingHours?.end || "17:00"
);

    const requestedStart = toMinutes(appointmentTime);
    const requestedEnd = requestedStart + serviceDuration;

    if (requestedStart < workingStart || requestedEnd > workingEnd) {
      return NextResponse.json(
        {
          message: `Appointment time must be within working hours: ${String(
            Math.floor(workingStart / 60)
          ).padStart(2, "0")}:${String(workingStart % 60).padStart(
            2,
            "0"
          )} - ${String(Math.floor(workingEnd / 60)).padStart(2, "0")}:${String(
            workingEnd % 60
          ).padStart(2, "0")}`,
        },
        { status: 400 }
      );
    }

    // 🔍 Check for conflicting appointments (excluding this one)
    const existingAppointments = await Appointment.find({
      barber: barber._id,
      appointmentDate,
      _id: { $ne: _id },
    }).populate("service");

    const hasConflict = existingAppointments.some((existing) => {
      const existingStart = toMinutes(existing.appointmentTime);
      const existingEnd = existingStart + (existing.service?.duration || 15);
      return (
        requestedStart < existingEnd && requestedEnd > existingStart // Overlap
      );
    });

    if (hasConflict) {
      // Find the next possible free time after all conflicts
      let latestEnd = requestedStart;
      let hasPending = false;

      for (const appt of existingAppointments) {
        const apptStart = toMinutes(appt.appointmentTime);
        const apptEnd = apptStart + (appt.service?.duration || 15);

        if (requestedStart < apptEnd && requestedEnd > apptStart) {
          latestEnd = Math.max(latestEnd, apptEnd);
          if (appt.status === "pending") hasPending = true;
        }
      }

      const nextAvailableHour = Math.floor(latestEnd / 60);
      const nextAvailableMin = latestEnd % 60;
      const formattedTime = `${String(nextAvailableHour).padStart(
        2,
        "0"
      )}:${String(nextAvailableMin).padStart(2, "0")}`;

      return NextResponse.json(
        {
          message: `Time slot is occupied (${
            hasPending ? "pending" : "confirmed"
          } appointment). Next available:`,
          nextAvailableTime: formattedTime,
          existingAppointments,
        },
        { status: 409 }
      );
    }

    // ✅ Update appointment
    const updated = await Appointment.findByIdAndUpdate(
      _id,
      { status, service, appointmentDate, appointmentTime },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Appointment updated successfully.",
        appointment: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { message: "Failed to update appointment." },
      { status: 500 }
    );
  }
}









// export async function PUT(request: NextRequest) {

//   try {
//     const { _id, status, service, appointmentDate, appointmentTime } =
//       await request.json();

//     // Verify token and extract the user ID
//     const TokenPayLoad = verifyToken(request);
//     const userId = TokenPayLoad?.id;
//     if (!userId) {
//       return NextResponse.json(
//         { message: "Authorization required to update an appointment." },
//         { status: 401 }
//       );
//     }

//     // Check if the appointment exists
//     const appointment = await Appointment.findById(_id);
//     if (!appointment) {
//       return NextResponse.json(
//         { error: "Appointment not found." },
//         { status: 404 }
//       );
//     }

//     // Convert time string "HH:MM" to minutes
//     const convertTimeToMinutes = (time: string) => {
//       const [hours, minutes] = time.split(":").map(Number);
//       return hours * 60 + minutes;
//     };

//     // Get current date and time for validation
//     const currentDate = new Date();
//     const currentDateString = currentDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format
//     const currentTimeInMinutes =
//       currentDate.getHours() * 60 + currentDate.getMinutes();

//     // Check if the appointment date is in the past
//     if (appointmentDate < currentDateString) {
//       return NextResponse.json(
//         { message: "Cannot update to a past date." },
//         { status: 400 }
//       );
//     }

//     // If the appointment date is today, check if the appointment time is in the past
//     if (appointmentDate === currentDateString) {
//       const requestedTimeInMinutes = convertTimeToMinutes(appointmentTime);
//       if (requestedTimeInMinutes < currentTimeInMinutes) {
//         return NextResponse.json(
//           { message: "Cannot update to a past time." },
//           { status: 400 }
//         );
//       }
//     }

//     // Check if service exists and get its duration
//     const serviceModel = await Service.findById(service);
//     if (!serviceModel) {
//       return NextResponse.json(
//         { message: "Service not found." },
//         { status: 404 }
//       );
//     }

//     const serviceDurationInMinutes = serviceModel.duration;

//     // Get the barber/staff member details to check working hours
//     const barber = await User.findById(appointment.barber);
//     if (!barber) {
//       return NextResponse.json(
//         { message: "Barber not found." },
//         { status: 404 }
//       );
//     }

//     // Check if barber is on holiday
//     if (barber.isOnHoliday) {
//       return NextResponse.json(
//         { message: "Barber is currently on holiday." },
//         { status: 400 }
//       );
//     }

//     // Helper function to convert time to minutes
//     const toMinutes = (time: string): number => {
//       const [h, m] = time.split(":").map(Number);
//       return h * 60 + m;
//     };

//     // Check working hours for the appointment date
//     const customDay = barber.customAvailableHours?.find(
//       (customHour: { date: any }) => customHour.date === appointmentDate
//     );
//     const hasCustom = !!customDay;

//     const workingStart = toMinutes(
//       hasCustom ? customDay.start : barber.workingHours?.start || "09:00"
//     );
//     const workingEnd = toMinutes(
//       hasCustom ? customDay.end : barber.workingHours?.end || "17:00"
//     );

//        // Get existing appointments for overlap checking
//     const existingAppointments = await Appointment.find({
//       barber: appointment.barber,
//       appointmentDate,
//       _id: { $ne: _id }, // Exclude current appointment
//     }).populate("service");


 
//     const requestedTimeInMinutes = convertTimeToMinutes(appointmentTime);
//     const appointmentEndTime = requestedTimeInMinutes + serviceDurationInMinutes;


//     // Check if appointment time is within working hours
//     if (requestedTimeInMinutes < workingStart || appointmentEndTime > workingEnd) {
//       const workingStartTime = Math.floor(workingStart / 60).toString().padStart(2, "0") + ":" + 
//                               (workingStart % 60).toString().padStart(2, "0");
//       const workingEndTime = Math.floor(workingEnd / 60).toString().padStart(2, "0") + ":" + 
//                             (workingEnd % 60).toString().padStart(2, "0");
      
//       return NextResponse.json(
//         { 
//           message: `Appointment time must be within barber's working hours: ${workingStartTime} - ${workingEndTime}` 
//         },
//         { status: 400 }
//       );
//     }

//     // Find existing appointments for the same barber on the requested date
    


//     // Check for time overlaps with existing appointments
//     const isTimeOccupied = existingAppointments.some((existingAppointment) => {
//       const existingTimeInMinutes = convertTimeToMinutes(
//         existingAppointment.appointmentTime
//       );
      
//       // Get the actual duration of the existing appointment's service
//       const existingServiceDuration = existingAppointment.service?.duration || 15; // fallback to 15 minutes
//       const existingEndTimeInMinutes = existingTimeInMinutes + existingServiceDuration;

//       // Check for time overlap - appointments overlap if:
//       // 1. New appointment starts before existing ends AND new appointment ends after existing starts
//       return (
//         (requestedTimeInMinutes >= existingTimeInMinutes && requestedTimeInMinutes < existingEndTimeInMinutes) ||
//         (appointmentEndTime > existingTimeInMinutes && appointmentEndTime <= existingEndTimeInMinutes) ||
//         (requestedTimeInMinutes <= existingTimeInMinutes && appointmentEndTime >= existingEndTimeInMinutes)
//       );
//     });

//     if (isTimeOccupied) {
//       // Find the next available time
//       let nextAvailableTime = requestedTimeInMinutes;
//       let hasPending = false;

//       for (const existingAppointment of existingAppointments) {
//         const existingTimeInMinutes = convertTimeToMinutes(
//           existingAppointment.appointmentTime
//         );
//         const existingServiceDuration = existingAppointment.service?.duration || 15;

//         if (existingAppointment.status === "pending") {
//           hasPending = true;
//           nextAvailableTime = Math.max(
//             nextAvailableTime,
//             existingTimeInMinutes + existingServiceDuration
//           );
//         } else if (existingAppointment.status === "confirmed") {
//           nextAvailableTime = Math.max(
//             nextAvailableTime,
//             existingTimeInMinutes + existingServiceDuration
//           );
//         }
//       }

//       // Convert nextAvailableTime back to "HH:MM" format
//       const nextAvailableHour = Math.floor(nextAvailableTime / 60);
//       const nextAvailableMinute = nextAvailableTime % 60;
//       const formattedNextAvailableTime = `${String(nextAvailableHour).padStart(
//         2,
//         "0"
//       )}:${String(nextAvailableMinute).padStart(2, "0")}`;

//       // Return response based on the conflict
//       if (hasPending) {
//         return NextResponse.json({
//           message: "There is a pending appointment at the selected time. Next available time:",
//           nextAvailableTime: formattedNextAvailableTime,
//           existingAppointments,
//         }, { status: 409 });
//       } else {
//         return NextResponse.json({
//           message: "There is a confirmed appointment at the selected time. Next available time:",
//           nextAvailableTime: formattedNextAvailableTime,
//           existingAppointments,
//         }, { status: 409 });
//       }
//     }

//     // Update the appointment since there's no conflict
//     const updatedAppointment = await Appointment.findByIdAndUpdate(
//       _id,
//       { status, service, appointmentDate, appointmentTime },
//       { new: true }
//     );

//     return NextResponse.json({
//       message: "Appointment updated successfully",
//       appointment: updatedAppointment,
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Error while updating appointment:", error);
//     return NextResponse.json(
//       { message: "Failed to update appointment." },
//       { status: 500 }
//     );
//   }
// }




















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
