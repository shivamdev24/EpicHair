// // EditStaffForm.tsx

// "use client";

// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import HashLoader from "react-spinners/HashLoader";

// interface EditStaffFormProps {
//   params: {
//     id: string;
//   };
// }

// interface WorkingHours {
//   start: string;
//   end: string;
// }

// interface ServiceType {
//   length: number;
//   _id: string;
//   name: string;
// }

// interface HolidayDates {
//   from: string;
//   to: string;
// }

// const EditStaffForm: React.FC<EditStaffFormProps> = ({ params }) => {
//   const router = useRouter();
//   const [holidayDates, setHolidayDates] = useState<HolidayDates>({
//     from: "",
//     to: "",
//   });

//   const [loading, setLoading] = useState<boolean>(true);
//   const [isOnHoliday, SetIsOnHoliday] = useState<boolean>(true);
//   const [username, setUsername] = useState<string>("");
//   const [role, setRole] = useState<string>("user");
//   const [feedback, setFeedback] = useState<string>("");
//   const [rating, setRating] = useState<number | "">("");
//   const [services, setServices] = useState<string[]>([]);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [workingHours, setWorkingHours] = useState<WorkingHours>({
//     start: "",
//     end: "",
//   });

//   const [availableServices, setAvailableServices] = useState<ServiceType[]>([]);

//   const id = params.id;

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const response = await fetch("/api/service"); // Adjust the endpoint as necessary
//         const data = await response.json();

//         // Log the entire response to verify what you're receiving
//         console.log("Fetched Services Data:", data);

//         // Assuming data is the array of services
//         if (Array.isArray(data)) {
//           setAvailableServices(data);
//           console.log("availableServices", data); // Check what you're receiving
//         } else {
//           console.error("Services data is not in the expected format:", data);
//         }
//       } catch (error) {
//         console.error("Error fetching services:", error);
//       }
//     };

//     fetchServices();
//   }, []);

//   useEffect(() => {
//     if (id) {
//       const fetchStaffData = async () => {
//         try {
//           const response = await fetch(`/api/admin/staff/specificId?id=${id}`);
//           if (!response.ok) throw new Error("Failed to fetch staff data");
//           const data = await response.json();
//           setUsername(data.staff.username);
//           setWorkingHours({
//             start: data.staff.workingHours.start,
//             end: data.staff.workingHours.end,
//           });
//           const holiday =
//             Array.isArray(data.staff.holidayDates) &&
//             data.staff.holidayDates.length > 0
//               ? data.staff.holidayDates[0]
//               : { from: "", to: "" };

//           setHolidayDates({
//             from: holiday.from,
//             to: holiday.to,
//           });

//           setRole(data.staff.role);
//           setFeedback(data.staff.feedback);
//           setRating(data.staff.rating !== null ? data.staff.rating : "");
//           setServices(data.staff.services || []);
//           // console.log(data)
//           setLoading(false);
//         } catch (error) {
//           console.error("Error fetching staff data:", error);
//           setErrorMessage(
//             "Could not fetch staff data. Please try again later."
//           );
//         }
//       };
//       fetchStaffData();
//     }
//   }, [id]);

//   // Handle checkbox change for services
//   const handleServiceChange = (service: string) => {
//     if (services.includes(service)) {
//       setServices(services.filter((s) => s !== service));
//     } else {
//       setServices([...services, service]);
//     }
//   };

//   const handleSubmit = async (e: { preventDefault: () => void }) => {
//     e.preventDefault();
//     setLoading(true);
//     // Ensure optional fields are not undefined
//     const updatedUser = {
//       id,
//       username,
//       role: role || "user",
//       feedback: feedback ?? "",
//       workingHours,
//       isOnHoliday,
//       rating: rating !== undefined ? parseFloat(rating as string) : null,
//       services: services.length ? services : [],
//       holidayDates: holidayDates.from && holidayDates.to ? [holidayDates] : [],
//     };

//     // Log data being submitted
//     // console.log("Submitting user data:", updatedUser);

//     try {
//       const response = await fetch(`/api/admin/staff?id=${id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedUser),
//       });

//       const responseData = await response.json();
//       console.log("API Response Data:", response);

//       if (!response.ok) {
//         throw new Error(responseData.message || "Failed to update user");
//       }
//       router.push("/dashboard/staff");
//     } catch (error) {
//       console.error("Error updating user:", error);
//       setErrorMessage("Could not update user. Please try again later.");
//     }
//   };

//   if (loading) {
//     return (
//       <p className="flex mx-auto h-screen w-screen justify-center items-center text-6xl">
//         <HashLoader
//           color="#000"
//           loading={loading}
//           size={80}
//           aria-label="Loading Spinner"
//           data-testid="loader"
//         />
//       </p>
//     );
//   }

//   return (
//     <div className="px-5 py-5">
//       <Link
//         href="/dashboard/staff"
//         className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
//       >
//         Back
//       </Link>

//       <Card className="m-4 w-full md:max-w-4xl mx-auto mt-12">
//         <CardHeader>
//           <CardTitle>Edit Staff</CardTitle>
//         </CardHeader>
//         {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//         <form onSubmit={handleSubmit}>
//           <CardContent>
//             <label>Username:</label>
//             <Input
//               id="userId"
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </CardContent>

//           <CardContent>
//             <label>Role:</label>
//             <input type="text" placeholder="Staff" disabled />
//           </CardContent>
//           <CardContent>
//             <label>Feedback:</label>
//             <Input
//               id="userId"
//               type="text"
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//             />
//           </CardContent>
//           <CardContent>
//             <label>
//               Working Hours: <span className="text-red-500">*</span>
//             </label>
//             <div className="flex gap-4 flex-col md:flex-row">
//               <div className="w-full">
//                 <label>Start Time:</label>
//                 <Input
//                   type="time"
//                   value={workingHours.start}
//                   onChange={(e) =>
//                     setWorkingHours({ ...workingHours, start: e.target.value })
//                   }
//                   required
//                 />
//               </div>
//               <div className="w-full">
//                 <label>End Time:</label>
//                 <Input
//                   type="time"
//                   value={workingHours.end}
//                   onChange={(e) =>
//                     setWorkingHours({ ...workingHours, end: e.target.value })
//                   }
//                   required
//                 />
//               </div>
//             </div>
//           </CardContent>
//           <CardContent>
//             <label>Holiday Dates:</label>
//             <div className="flex gap-4 flex-col md:flex-row">
//               <div className="w-full">
//                 <label>From:</label>
//                 <Input
//                   type="date"
//                   value={holidayDates.from}
//                   onChange={(e) =>
//                     setHolidayDates({ ...holidayDates, from: e.target.value })
//                   }
//                 />
//               </div>
//               <div className="w-full">
//                 <label>To:</label>
//                 <Input
//                   type="date"
//                   value={holidayDates.to}
//                   onChange={(e) =>
//                     setHolidayDates({ ...holidayDates, to: e.target.value })
//                   }
//                 />
//               </div>
//             </div>
//           </CardContent>

//           <CardContent>
//             <label className="block font-medium mb-1">Is On Holiday?</label>
//             <div className="flex gap-4">
//               <label className="flex items-center gap-1">
//                 <input
//                   type="radio"
//                   name="isOnHoliday"
//                   value="true"
//                   checked={isOnHoliday === true}
//                   onChange={() => SetIsOnHoliday(true)}
//                 />
//                 Yes
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="radio"
//                   name="isOnHoliday"
//                   value="false"
//                   checked={isOnHoliday === false}
//                   onChange={() => SetIsOnHoliday(false)}
//                 />
//                 No
//               </label>
//             </div>
//           </CardContent>

//           <CardContent>
//             <label>
//               Services List : ( select services ){" "}
//               <span className="text-red-500">*</span>
//             </label>
//             <div className="flex gap-4 flex-col md:flex-row">
//               {availableServices.length > 0 ? (
//                 availableServices.map((service) => (
//                   <div key={service._id} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id={service._id} // Using service._id for the checkbox id
//                       checked={services.includes(service.name)}
//                       onChange={() => handleServiceChange(service.name)} // Using service._id in the handle function
//                       className="mr-2"
//                     />
//                     <label htmlFor={service._id}>{service.name}</label>{" "}
//                     {/* Rendering service name */}
//                   </div>
//                 ))
//               ) : (
//                 <p>No services available.</p>
//               )}
//             </div>
//           </CardContent>

//           <CardContent>
//             <label>Rating:</label>
//             <Input
//               id="userId"
//               type="number"
//               value={rating !== "" ? rating : ""}
//               onChange={(e) =>
//                 setRating(e.target.value ? Number(e.target.value) : "")
//               }
//               min="1"
//               max="5"
//             />
//           </CardContent>

//           <CardContent>
//             <Button
//               type="submit"
//               className="mr-2 w-full bg-blue-500 hover:bg-blue-600"
//             >
//               Update User
//             </Button>
//           </CardContent>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default EditStaffForm;

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import HashLoader from "react-spinners/HashLoader";

interface EditStaffFormProps {
  params: { id: string };
}

interface WorkingHours {
  start: string;
  end: string;
}

interface ServiceType {
  _id: string;
  name: string;
}

interface HolidayDates {
  from: string;
  to: string;
}

const EditStaffForm: React.FC<EditStaffFormProps> = ({ params }) => {
  const router = useRouter();
  const { id } = params;

  const [holidayDates, setHolidayDates] = useState<HolidayDates>({
    from: "",
    to: "",
  });
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: "",
    end: "",
  });
  const [availableServices, setAvailableServices] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const [username, setUsername] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number | "">("");
  const [isOnHoliday, setIsOnHoliday] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch available services
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/service");
        const data = await res.json();
        if (Array.isArray(data)) setAvailableServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    })();
  }, []);

  // Fetch staff details
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/staff/specificId?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch staff data");
        const { staff } = await res.json();

        setUsername(staff.username);
        setWorkingHours(staff.workingHours);
        setHolidayDates(
          Array.isArray(staff.holidayDates) && staff.holidayDates.length
            ? staff.holidayDates[0]
            : { from: "", to: "" }
        );
        setRole(staff.role);
        setFeedback(staff.feedback ?? "");
        setRating(staff.rating ?? "");
        setServices(staff.services ?? []);
        setIsOnHoliday(staff.isOnHoliday ?? false);
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setErrorMessage("Could not fetch staff data. Please try again later.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleServiceChange = (serviceName: string) => {
    setServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const payload = {
  //     id,
  //     username,
  //     role,
  //     feedback,
  //     workingHours,
  //     isOnHoliday,
  //     rating: rating === "" ? null : Number(rating),
  //     services,
  //     holidayDates: holidayDates.from && holidayDates.to ? [holidayDates] : [],
  //   };

  //   try {
  //     const res = await fetch(`/api/admin/staff?id=${id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const responseData = await res.json();
  //     if (!res.ok)
  //       throw new Error(responseData.message || "Failed to update user");
  //     router.push("/dashboard/staff");
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     setErrorMessage("Could not update user. Please try again later.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    // Prevent wiping out holidayDates if left unchanged
    const holidayArray =
      holidayDates.from.trim() && holidayDates.to.trim()
        ? [holidayDates]
        : holidayDates.from.trim() === "" && holidayDates.to.trim() === ""
        ? [] // both empty, so remove holidays
        : [holidayDates]; // one is empty, but still pass what user entered

    const updatedUser = {
      id,
      username,
      role: role || "user",
      feedback: feedback ?? "",
      workingHours,
      isOnHoliday,
      rating: rating !== undefined ? parseFloat(rating as string) : null,
      services: services.length ? services : [],
      holidayDates: holidayArray,
    };

    try {
      const response = await fetch(`/api/admin/staff?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const responseData = await response.json();
      console.log("API Response Data:", response);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update user");
      }
      router.push("/dashboard/staff");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Could not update user. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#000" size={80} />
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      <Link
        href="/dashboard/staff"
        className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
      >
        Back
      </Link>

      <Card className="m-4 w-full md:max-w-4xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Edit Staff</CardTitle>
        </CardHeader>

        {errorMessage && (
          <p className="text-red-500 text-center">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent>
            <label>Username:</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </CardContent>

          <CardContent>
            <label>Role:</label>
            <Input type="text" value={role} disabled />
          </CardContent>

          <CardContent>
            <label>Feedback:</label>
            <Input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
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
                    setWorkingHours({ ...workingHours, start: e.target.value })
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
            <label>Holiday Dates:</label>
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="w-full">
                <label>From:</label>
                <Input
                  type="date"
                  value={holidayDates.from}
                  onChange={(e) =>
                    setHolidayDates({ ...holidayDates, from: e.target.value })
                  }
                />
              </div>
              <div className="w-full">
                <label>To:</label>
                <Input
                  type="date"
                  value={holidayDates.to}
                  onChange={(e) =>
                    setHolidayDates({ ...holidayDates, to: e.target.value })
                  }
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
                  checked={isOnHoliday}
                  onChange={() => setIsOnHoliday(true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={!isOnHoliday}
                  onChange={() => setIsOnHoliday(false)}
                />
                No
              </label>
            </div>
          </CardContent>

          <CardContent>
            <label>
              Services List: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 flex-col md:flex-row flex-wrap">
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
            <label>Rating:</label>
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

          <CardContent>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Update User
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default EditStaffForm;
