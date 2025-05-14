// This route handles the retrieval of staff information and their available slots
// based on their working hours and existing appointments.


// src/app/api/staffinfo/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { verifyToken } from "@/utils/Token";

db();

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTimeString = (minutes: number): string => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

interface AppointmentData {
  start: number;
  end: number;
}

export async function GET(request: NextRequest) {
  try {
    verifyToken(request);

    const staffMembers = await User.find({
      role: "staff",
      isOnHoliday: false,
    });

    const GAP = 15; // Minutes between slots
    const FALLBACK_DURATION = 15; // Default duration if service duration not found

    const staffWithSlots = await Promise.all(
      staffMembers.map(async (staff) => {
        const workingStart = toMinutes(
          staff.AvailableHours?.start || staff.workingHours?.start || "10:00"
        );
        const workingEnd = toMinutes(
          staff.AvailableHours?.end || staff.workingHours?.end || "18:00"
        );

        // Appointments with populated service
        const appointments = await Appointment.find({
          barber: staff._id,
        }).populate("service");

       

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedAppointments: AppointmentData[] = appointments.map((appt: any) => {
          const startMin = toMinutes(appt.appointmentTime || appt.time);
          const duration = appt.service?.duration ?? FALLBACK_DURATION;
          return {
            start: startMin,
            end: startMin + duration,
          };
        });

        // Build the slots
        const slots: { time: string; available: boolean }[] = [];
        for (let t = workingStart; t + FALLBACK_DURATION <= workingEnd; t += GAP) {
          const slotStart = t;
          const slotEnd = slotStart + FALLBACK_DURATION;

          const overlaps = formattedAppointments.some(
            (appt) => slotStart < appt.end && slotEnd > appt.start
          );

          slots.push({
            time: toTimeString(slotStart),
            available: !overlaps,
          });
        }

        return {
          ...staff.toObject(),
          availableSlots: slots,
        };
      })
    );

    return NextResponse.json(
      {
        message: "Staff with dynamic slots retrieved.",
        staffWithSlots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Slot generation error:", error);
    return NextResponse.json(
      { message: "Failed to fetch slots", error },
      { status: 500 }
    );
  }
}
