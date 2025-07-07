

import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { verifyToken } from "@/utils/Token";

db();

interface AppointmentData {
  start: number;
  end: number;
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTimeString = (minutes: number): string => {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const getNextNDates = (n: number): string[] => {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export async function GET(request: NextRequest) {
  try {
    verifyToken(request);

    const staffMembers = await User.find({
      role: "staff",
      isOnHoliday: false,
    });

    const GAP = 15;
    const FALLBACK_DURATION = 15;
    const DAYS_TO_SHOW = 7;

    const staffWithSlots = await Promise.all(
      staffMembers.map(async (staff) => {
        const dates = getNextNDates(DAYS_TO_SHOW);
        const staffSlotsByDate: {
          date: string;
          slots: { time: string; available: boolean }[];
        }[] = [];

        const appointments = await Appointment.find({
          barber: staff._id,
        }).populate("service");

        const appointmentsByDate: Record<string, AppointmentData[]> = {};

        for (const appt of appointments) {
          const date = appt.appointmentDate?.toISOString().split("T")[0];
          const time = appt.appointmentTime || appt.time;
          if (!date || !time) continue;

          const startMin = toMinutes(time);
          const duration = appt.service?.duration ?? FALLBACK_DURATION;

          if (!appointmentsByDate[date]) {
            appointmentsByDate[date] = [];
          }

          appointmentsByDate[date].push({
            start: startMin,
            end: startMin + duration,
          });
        }

        for (const date of dates) {
          // 🛑 Skip slot generation if the staff has a holiday on this date
          const isHoliday = staff.holidayDates?.some(
            (range: { from: string; to: string }) => {
              return date >= range.from && date <= range.to;
            }
          );

          if (isHoliday) {
            console.log(`[${staff.name}] Skipping ${date} (holiday)`);
            continue;
          }

          const customDay = staff.customAvailableHours?.find(
            (d: { date: string }) => d.date === date
          );
          const workingStart = toMinutes(
            customDay?.start || staff.workingHours?.start || "09:00"
          );
          const workingEnd = toMinutes(
            customDay?.end || staff.workingHours?.end || "17:00"
          );

          const dayAppointments = appointmentsByDate[date] || [];
          const slots: { time: string; available: boolean }[] = [];

          for (
            let t = workingStart;
            t + FALLBACK_DURATION <= workingEnd;
            t += GAP
          ) {
            const slotStart = t;
            const slotEnd = t + FALLBACK_DURATION;

            const overlaps = dayAppointments.some(
              (appt) => slotStart < appt.end && slotEnd > appt.start
            );

            slots.push({
              time: toTimeString(slotStart),
              available: !overlaps,
            });
          }

          staffSlotsByDate.push({ date, slots });
        }

        return {
          ...staff.toObject(),
          availableSlots: staffSlotsByDate,
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
