"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ServiceType {
  _id: string;
  name: string;
}

interface WorkingHours {
  start: string;
  end: string;
}

const CreateStaffForm: React.FC = () => {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number | "">("");
  const [services, setServices] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [availableServices, setAvailableServices] = useState<ServiceType[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: "",
    end: "",
  });
  const [isOnHoliday, SetIsOnHoliday] = useState<boolean>(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/service");
        const data = await response.json();

        // console.log("Fetched Services Data:", data);

        if (Array.isArray(data)) {
          setAvailableServices(data);
        } else {
          // console.error("Services data is not in the expected format:", data);
          throw new Error("Services data is not in the expected format");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // console.error("Error fetching services:", error);
        throw new Error("Error fetching services");
      }
    };

    fetchServices();
  }, []);

  // Handle checkbox change for services
  const handleServiceChange = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter((s) => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Ensure optional fields are not undefined
    const newStaff = {
      username: username.trim() || "",
      phoneNumber: phoneNumber.trim() || "",
      role: "staff", // Default to 'staff'
      workingHours: workingHours, // Send as a single object, not an array
      isOnHoliday: isOnHoliday,
      feedback: feedback.trim() || "",
      rating: rating !== "" ? parseFloat(rating as unknown as string) : null,
      services: services.filter((service) => service.trim() !== ""),
    };

    // console.log("Submitting new staff data:", newStaff);

    // Check required fields
    if (
      !newStaff.username ||
      !newStaff.phoneNumber ||
      newStaff.services.length === 0
    ) {
      setErrorMessage(
        "Username, phone number, and at least one service are required."
      );
      return;
    }

    // Validate working hours
    if (!workingHours.start || !workingHours.end) {
      setErrorMessage("Working hours are required for staff members.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });

      const responseData = await response.json();
      // console.log("API Response Data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Error creating staff");
      }

      router.push("/dashboard/staff");
    } catch (error) {
      // console.error("Error creating staff:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create staff. Please try again later."
      );
    }
  };

  return (
    <>
      <div className="px-5 py-5">
        <Link
          href="/dashboard/staff"
          className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
        >
          Back
        </Link>

        <Card className="m-4 w-full md:max-w-4xl mx-auto mt-12">
          <CardHeader>
            <CardTitle>Create Staff</CardTitle>
          </CardHeader>
          {errorMessage && <p className="text-red-500 px-6">{errorMessage}</p>}
          <form onSubmit={handleSubmit}>
            <CardContent>
              <label>
                Username: <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </CardContent>
            {/* <CardContent>
                            <label>Email:</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional, as email is sparse in the database</p>
                        </CardContent> */}
            <CardContent>
              <label>
                Phone Number: <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </CardContent>

            <CardContent>
              <label>
                Role: <span className="text-red-500">*</span>
              </label>
              <Input type="text" placeholder="Staff" disabled />
            </CardContent>

            <CardContent>
              <label>
                Working Hours: <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="w-full">
                  <label>Start Time:</label>
                  <Input
                    type="time"
                    value={workingHours.start}
                    onChange={(e) =>
                      setWorkingHours({
                        ...workingHours,
                        start: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="w-full">
                  <label>End Time:</label>
                  <Input
                    type="time"
                    value={workingHours.end}
                    onChange={(e) =>
                      setWorkingHours({ ...workingHours, end: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardContent>
              <label className="block font-medium mb-1">Is On Holiday?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isOnHoliday"
                    value="true"
                    checked={isOnHoliday === true}
                    onChange={() => SetIsOnHoliday(true)}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isOnHoliday"
                    value="false"
                    checked={isOnHoliday === false}
                    onChange={() => SetIsOnHoliday(false)}
                  />
                  No
                </label>
              </div>
            </CardContent>

            <CardContent>
              <label>
                Services List: (select services){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 flex-wrap mt-2">
                {availableServices.length > 0 ? (
                  availableServices.map((service) => (
                    <div key={service._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={service._id}
                        checked={services.includes(service.name)}
                        onChange={() => handleServiceChange(service.name)}
                        className="mr-2"
                      />
                      <label htmlFor={service._id}>{service.name}</label>
                    </div>
                  ))
                ) : (
                  <p>No services available.</p>
                )}
              </div>
            </CardContent>

            <CardContent>
              <label>Feedback (Optional):</label>
              <Input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </CardContent>

            <CardContent>
              <label>Rating (Optional):</label>
              <Input
                type="number"
                value={rating !== "" ? rating : ""}
                onChange={(e) =>
                  setRating(e.target.value ? Number(e.target.value) : "")
                }
                min="1"
                max="5"
              />
            </CardContent>

            

            <CardContent className="form-actions mt-4 flex justify-end">
              <Button
                type="submit"
                className="mr-2 w-full ml-2 bg-blue-600 hover:bg-blue-500"
              >
                Create Staff
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </>
  );
};

export default CreateStaffForm;
