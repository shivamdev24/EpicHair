

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HashLoader from "react-spinners/HashLoader";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Appointment {
  _id: string;
  barber: { username: string, phoneNumber: string } | null;
  user: { phoneNumber: string, username: string } ;
  service: { _id: string; name: string } | null; 
  appointmentDate: string;
  appointmentTime?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  appointmentType: "inApp" | "WalkIn";
  feedback?: string;
  rating?: number;
}

const Appointment = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/appointment");
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        // console.log( "appointments" , data)
        
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/admin/appointment?id=${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.log(`Error deleting appointment. Status: ${response.status}`);
        const errorMessage = await response.text();
        console.error(`Error message from server: ${errorMessage}`);
        throw new Error(`Failed to delete appointment: ${errorMessage}`);
      }

      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== appointmentId)
      );

      console.log("Appointment deleted successfully");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("An error occurred while deleting the appointment");
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert to 12-hour format, handle '0' as '12'
    return `${hour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <p className="flex mx-auto h-screen justify-center items-center text-6xl">
        <HashLoader
          color="#000"
          loading={loading}
          size={80}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </p>
    );
  }

  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = appointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(appointments.length / itemsPerPage);



  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Link
          href="/dashboard"
          className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
        >
          Back
        </Link>
        <Link
          href="/dashboard/appointments/newAppointment"
          className="px-6 hover:bg-gray-900 p-2 bg-blue-500 text-white rounded"
        >
          New Appointment
        </Link>
      </div>
      {error ? <div className="text-red-500">{error}</div> : ""}
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 border-2 border-gray-300 text-center text-sm leading-4 text-gray-600 tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300 text-center text-sm leading-4 text-gray-600 tracking-wider">
                    User Phone Number
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300 text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Barber
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300 text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Barber Phone Number
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300 text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Appointment Date
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Appointment Time
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Feedback
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 border-2 border-gray-300  text-center text-sm leading-4 text-gray-600 tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-100">
                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.user?.username || "No User"}
                    </td>
                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.user?.phoneNumber || "No User"}
                    </td>
                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.barber?.username || "Unknown Barber"}
                    </td>
                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.barber?.phoneNumber || "Unknown Barber"}
                    </td>
                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.service?.name || "No Services"}
                    </td>
                    {/* <td className="px-6 text-center py-4 whitespace-no-wrap border border-gray-300">
                      {typeof appointment.service === "object" ? appointment.service?.name : appointment.service || "No Services"}
                    </td> */}

                    <td className="px-4 text-center  py-4 whitespace-no-wrap border border-gray-300">
                      {new Date(appointment.appointmentDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )}
                    </td>
                    {/* <td className="px-6 text-center py-4 whitespace-no-wrap border border-gray-300">{appointment.appointmentTime || "Not Set"}</td> */}
                    <td className="border border-gray-300 px-4 py-4 text-center">
                      {appointment.appointmentTime
                        ? formatTime(appointment.appointmentTime as string)
                        : "N/A"}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-4 text-white font-bold text-center ${
                        appointment.status === "pending"
                          ? "bg-yellow-600"
                          : appointment.status === "confirmed"
                          ? "bg-green-500"
                          : appointment.status === "completed"
                          ? "bg-blue-500"
                          : appointment.status === "cancelled"
                          ? "bg-red-500"
                          : "text-gray-500" // Fallback color for undefined status
                      }`}
                    >
                      {appointment.status}
                    </td>
                    <td className="px-4 text-center py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.appointmentType}
                    </td>
                    <td className="px-4 text-center py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.feedback || "No Feedback"}
                    </td>
                    <td className="px-4 text-center py-4 whitespace-no-wrap border border-gray-300">
                      {appointment.rating != null && !isNaN(appointment.rating)
                        ? appointment.rating
                        : "Not Rated"}
                    </td>

                    <td className=" px-4 py-5 border-b border-r  gap-3 border-gray-300 text-gray-600 flex items-center justify-center  ">
                      <Link href={`/dashboard/appointments/${appointment._id}`}>
                        <Button className=" bg-yellow-500 text-white rounded">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={() => deleteAppointment(appointment._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center items-center mt-4">
        Page :{" "}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`mx-1 px-3 py-1 border rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Appointment;
