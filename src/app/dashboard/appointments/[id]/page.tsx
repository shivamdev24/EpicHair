

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"












import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HashLoader from "react-spinners/HashLoader";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Appointment {
    _id: string;
    barber: { username: string } | null;
    user: { username: string } | null;
    service: string;
    appointmentDate: string;
    appointmentTime?: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    appointmentType: "inApp" | "WalkIn";
    feedback?: string;
    rating?: number;
}

interface Service {
    _id: string;
    name: string;
}

const AppointmentUpdate = () => {
    const router = useRouter();

    const { id } = useParams();

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [services, setServices] = useState<Service[]>([]); 
    const [selectedService, setSelectedService] = useState<string>("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [status, setStatus] = useState("");
    const [appointmentType, setAppointmentType] = useState("");
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState<number | null>(null);

    // const handleTimeChange = (event: { target: { value: any; }; }) => {
    //     const { value } = event.target;

    //     // Validate if the selected time is in 15-minute intervals
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     const [hours, minutes] = value.split(':').map(Number);
    //     if (minutes % 15 === 0) {
    //         setAppointmentTime(value);
    //     } else {
    //         alert('Please select a time in 15-minute intervals.');
    //         // Optionally, reset to the last valid time or keep the current one
    //         // setAppointmentTime(appointmentTime); // Uncomment to reset to last valid
    //     }
    // };

    useEffect(() => {

        console.log(id);
        const fetchAppointment = async () => {
            setLoading(true);
            try {
                const appointmentResponse = await fetch(`/api/admin/appointment/appointment-id?id=${id}`);
                const appointmentData = await appointmentResponse.json();
                console.log("Fetched Appointment Data:", appointmentData);

                // Format the date to YYYY-MM-DD
                const formattedDate = new Date(appointmentData.appointmentDate).toISOString().split('T')[0];

                setAppointment(appointmentData);
                setSelectedService(appointmentData.service);
                setAppointmentDate(formattedDate);
                setAppointmentTime(appointmentData.appointmentTime);
                setStatus(appointmentData.status);
                setAppointmentType(appointmentData.appointmentType);
                setFeedback(appointmentData.feedback || "");
                setRating(appointmentData.rating !== undefined ? appointmentData.rating : null);
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching appointment");
            } finally {
                setLoading(false);
            }
        };


        const fetchServices = async () => {
            try {
                const response = await fetch("/api/admin/service");
                const Service = await response.json();
                setServices(Service); 
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching services");
            }
        };

        fetchAppointment();
        fetchServices();
    }, [id]);
    console.log("app time",appointmentTime);

    

    const updateAppointment = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedService || !appointmentDate || !appointmentTime || !status) {
            console.log("Fields are required");
            return setError("Fields are required");
        }

        try {
            const response = await fetch(`/api/admin/appointment?id=${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    service: selectedService, 
                    appointmentDate, 
                    appointmentTime, 
                    status, 
                    appointmentType, 
                    feedback, 
                    rating,   
                }),
            });

           
            if (!response.ok) {
                const errorData = await response.json();
                console.log("Server error:", errorData);
                throw new Error("Failed to update appointment");
            }

            router.push("/dashboard/appointments");
            console.log("Appointment updated successfully", await response.json());

        } catch (err) {
            
            console.error("Error updating appointment:", err);
            setError("An error occurred while updating the appointment");
        }
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

    if (!appointment) {
        return <p>Appointment not found</p>;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <Link
                    href="/dashboard"
                    className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
                >
                    Back
                </Link>
            </div>
            {error ? <div className="text-red-500">{error}</div> : ""}
            <Card className="w-full mt-4">
                <CardHeader>
                    <CardTitle>Update Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={updateAppointment}>
                        <div className="flex flex-col space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Service
                                </label>
                                <select
                                    value={selectedService}
                                    required
                                    onChange={(event) => setSelectedService(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="" disabled>Select a service</option>
                                    {services.map((service) => (
                                        <option key={service._id} value={service.name}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Date
                                </label>
                                <input
                                    type="date"
                                    value={appointmentDate}
                                    required
                                    onChange={(event) => setAppointmentDate(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Time
                                </label>
                                <input
                                    type="time"
                                    value={appointmentTime}
                                    required
                                    onChange={(event) => setAppointmentTime(event.target.value)}
                                    // onChange={handleTimeChange}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    required
                                    onChange={(event) => setStatus(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Type
                                </label>
                                <select
                                    value={appointmentType}
                                    onChange={(event) => setAppointmentType(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="inApp">In-App</option>
                                    <option value="WalkIn">Walk-In</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Feedback
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(event) => setFeedback(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Rating
                                </label>
                                <input
                                    type="number"
                                    value={rating !== null ? rating : ""}
                                    onChange={(event) => setRating(Number(event.target.value))}
                                    min="1"
                                    max="5"
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Update Appointment
                                </button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

























export default AppointmentUpdate;
