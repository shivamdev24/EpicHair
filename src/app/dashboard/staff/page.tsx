"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import HashLoader from "react-spinners/HashLoader";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample User interface (define it according to your needs)
interface User {
  _id: string;
  username: string;
  phoneNumber: string;
  role: string;
  services: string[];
  image_url: string;
  isVerified: boolean;
  isOnHoliday: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  holidayDates: {
    from: string;
    to: string;
  };
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/staff");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      console.log("Staff Data", data);
      if (Array.isArray(data.staff)) {
        setUsers(data.staff);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.log(error);
      handleError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/staff?id=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (error) {
      console.log(error);
      handleError("Error deleting user");
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(""), 3000); // Show error for 3 seconds
  };

  const currentUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(users.length / usersPerPage);

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

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert to 12-hour format, handle '0' as '12'
    return `${hour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6">
      <Link
        href={`/dashboard/staff/newStaff`}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create New Staff
      </Link>

      {error && <p className="text-red-500">{error}</p>}

      <Card className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              {/* <th className="border border-gray-300 px-4 py-2">Staff Id</th> */}
              <th className="border border-gray-300 px-4 py-2">
                Staff Profile
              </th>
              <th className="border border-gray-300 px-4 py-2">Staff Name</th>
              <th className="border border-gray-300 px-4 py-2">
                Staff phoneNumber
              </th>
              <th className="border border-gray-300 px-4 py-2">Service</th>
              <th className="border border-gray-300 px-4 py-2">WorkingHours</th>
              <th className="border border-gray-300 px-4 py-2">Role</th>
              <th className="border border-gray-300 px-4 py-2">Verified</th>
              <th className="border border-gray-300 px-4 py-2">HolidayDates</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="rounded overflow-hidden">
            {currentUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100">
                {/* <td className="border border-gray-300 text-center px-4 py-2">{user._id}</td> */}
                <td className="border border-gray-300 px-4 py-2  ">
                  {" "}
                  <div className="flex justify-center items-center">
                    <Avatar className="">
                      <AvatarImage
                        src={user?.image_url || "https://github.com/shadcn.png"}
                        className="object-cover object-center"
                      />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="border border-gray-300 text-center px-4 py-2">
                  {user.username || "Not Updated"}
                </td>
                <td className="border border-gray-300 text-center px-4 py-2">
                  {user.phoneNumber}
                </td>

                {/* <td className="border border-gray-300 text-center px-4 py-2">{user?.services || "Not Updated"}</td> */}
                <td className="border border-gray-300 text-center px-4 py-2">
                  {user?.services && user.services.length > 0
                    ? user.services.join(", ")
                    : "Not Updated"}
                </td>
                <td className="border border-gray-300 px-4 py-4 text-center">
                  {user.workingHours?.start
                    ? formatTime(user.workingHours?.start as string)
                    : "N/A"}
                  <span>-</span>
                  {user.workingHours?.end
                    ? formatTime(user.workingHours?.end as string)
                    : "N/A"}
                </td>

                <td className="border border-gray-300 text-center px-4 py-2">
                  {user.role}
                </td>
                <td className="border border-gray-300 text-center px-4 py-2">
                  {user.isVerified ? "Yes" : "No"}
                </td>
                {/* <td className="border border-gray-300 text-center px-4 py-2">
                  {user.holidayDates && user.holidayDates.length > 0
                    ? `${user.holidayDates[0].from} - ${user.holidayDates[0].to}`
                    : "Working"}
                </td> */}
                <td className="border border-gray-300 text-center px-4 py-2">
                  {Array.isArray(user.holidayDates) &&
                  user.holidayDates.length > 0
                    ? `${user.holidayDates[0].from} - ${user.holidayDates[0].to}`
                    : "Working"}
                </td>

                <td className=" px-4 py-6 border-t  gap-3 text-center border-gray-300 text-gray-600 flex items-center justify-center ">
                  <Link
                    href={`/dashboard/staff/${user._id}`}
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </Link>
                  <button
                    className="text-white bg-red-500 px-2 py-1 rounded"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 justify-center flex ">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
