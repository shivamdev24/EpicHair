


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HashLoader from "react-spinners/HashLoader";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Service {
    _id: string;
    name: string;
}

interface Barber {
    role: string;
    _id: string;
    username: string;
    services: string[];
}

const NewAppointment = () => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState("");
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]); // Unfiltered barbers list
    const [filteredBarbers, setFilteredBarbers] = useState<Barber[]>([]); // Filtered list of barbers
    const [selectedService, setSelectedService] = useState<string>("");
    const [selectedBarber, setSelectedBarber] = useState<string>("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [status, setStatus] = useState<"pending" | "confirmed" | "completed" | "cancelled">("pending");
    // const [appointmentType, setAppointmentType] = useState<"inApp" | "WalkIn">("inApp");
    const [feedback, setFeedback] = useState("");
    const [rating, setRating] = useState<number | null>(null);

    // Normalize service name by converting to lowercase and removing spaces and hyphens
    const normalizeServiceName = (serviceName: string) => {
        return serviceName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    };

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesResponse = await axios.get("/api/admin/service");
                setServices(servicesResponse.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching services");
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Fetch all barbers
    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const response = await axios.get(`/api/admin/staff`);
                const data = response.data.staff;

                if (Array.isArray(data)) {
                    setBarbers(data); // Set full list of barbers
                    setFilteredBarbers(data); // Initially show all barbers
                } else {
                    setBarbers([]);
                    setFilteredBarbers([]);
                }
            } catch (error) {
                console.error(error);
                setError("Error fetching barbers");
            }
        };

        fetchBarbers();
    }, []);

    // Filter barbers based on selected service
    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedServiceId = event.target.value;
        setSelectedService(selectedServiceId);

        // Fetch services data from the API (consider caching or fetching only once)
        const fetchedServices = services;
        // console.log("Fetched Services:", fetchedServices);

        // Find the selected service by ID
        const selectedService = fetchedServices.find((service) => service._id === selectedServiceId);
        if (!selectedService) {
            console.log("Selected service not found");
            return;
        }
        const selectedServiceName = selectedService.name;
        // console.log("Selected Service Name:", selectedServiceName);

        // Filter barbers based on selected service
        const matchedBarbers = barbers.filter((barber) => {
            const normalizedBarberServices = barber.services.map(service =>
                normalizeServiceName(service)
            );
            return barber.role === "staff" && normalizedBarberServices.includes(normalizeServiceName(selectedServiceName));
        });
        // console.log("Matched Barbers:", matchedBarbers);
        setFilteredBarbers(matchedBarbers);
        setSelectedBarber(""); // Reset the selected barber when service changes
    };

    const createAppointment = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const newAppointment = {
            barber: selectedBarber,
            service: selectedService,
            appointmentDate,
            appointmentTime,
            status,
            // appointmentType,
            feedback,
            rating,
        }
        try {
            //  await axios.post(`/api/admin/appointment`, {
            //     barber: selectedBarber,
            //     service: selectedService,
            //     appointmentDate,
            //     appointmentTime,
            //     status,
            //     appointmentType,
            //     feedback,
            //     rating,
            // });

            const response = await fetch(`/api/admin/appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAppointment),
            });
        
            if (!response.ok) {
                setError("Failed to Create appointments");
                throw new Error("Failed to Create appointments");
            }
            console.log("Appointment created successfully", response);
            router.push("/dashboard/appointments");
        } catch (err) {
            console.error("Error creating appointment:", err);
            setError("An error occurred while creating the appointment");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <p className="flex mx-auto h-screen w-screen justify-center items-center text-6xl">
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
                    <CardTitle>Create New Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={createAppointment}>
                        <div className="flex flex-col space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Service <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedService}
                                    onChange={handleServiceChange}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="" disabled>Select a service</option>
                                    {services.map((service) => (
                                        <option key={service._id} value={service._id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Barber <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedBarber}
                                    onChange={(event) => setSelectedBarber(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="" disabled>Select a barber</option>
                                    {Array.isArray(filteredBarbers) && filteredBarbers.length > 0 ? (
                                        filteredBarbers.map((barber) => (
                                            <option key={barber._id} value={barber._id}>
                                                {barber.username} - Services: {barber.services.join(', ')}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No barbers available</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(event) => setAppointmentDate(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={appointmentTime}
                                    onChange={(event) => setAppointmentTime(event.target.value)}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={status}
                                    onChange={(event) =>
                                        setStatus(event.target.value as "pending" | "confirmed" | "completed" | "cancelled")
                                    }
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
                                    Appointment Type <span className="text-red-500">*</span>
                                </label> 
                                <select
                                    
                                    disabled
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
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
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Rating
                                </label>
                                <input
                                    type="number"
                                    value={rating ?? ""}
                                    onChange={(event) => setRating(Number(event.target.value))}
                                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    min="1"
                                    max="5"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md"
                                >
                                    Create Appointment
                                </button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewAppointment;