

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { toast } from "react-toastify";

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  image_url: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
  const [newImage, setNewImage] = useState<File | null>(null); // State for the new image file

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/admin/delete-account`);

        if (response.ok) {
          alert('Account deleted successfully.');
          router.push("/login"); // Adjust the route as necessary
        } else {
          console.error('Failed to delete account:', response.statusText);
          alert('Failed to delete account.');
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Error deleting account. Please try again later.", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      }
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await fetch("/api/admin/profile");

        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        setUser(data.user);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch user details", error);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, []); // No need to include user in the dependency array here.

  const handleClick = async () => {
    if (user) {
      router.push(`/dashboard/profile/${user.id}`);
    } else {
      console.error("User object is null");
    }
  };

  // Function to handle image upload
  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newImage) {
      const formData = new FormData();
      formData.append("image", newImage);
      setLoading(true);

      try {
        const response = await fetch(`/api/imageUpload`, {
          method: "PATCH",
          body: formData,
          // headers: {
            
          //   'Content-Type': 'application/json',
          // },
        });
        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser.user); // Update user state with new image URL
          setIsPopupOpen(false); // Close popup
          toast.success("Profile image updated successfully.");
          setLoading(false);
        } else {
          toast.error("Failed to upload image.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image. Please try again later.");
      }
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

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Failed to load user details.</div>;
  }

  return (
    <div className="px-5 py-5">
      <Link
        href="/dashboard"
        className="px-6 hover:bg-gray-900 p-2 bg-black text-white rounded"
      >
        Back
      </Link>

      <div className="m-4 w-full flex justify-center itmes-center border-none mx-auto mt-12">
        <CardHeader >
          <Image src={user.image_url} width={1000} height={1000} className=" w-40 h-40 object-center object-cover aspect-square border rounded-lg" alt="profile image" />
          <Button onClick={() => setIsPopupOpen(true)} className="mt-4 w-40 bg-blue-500 text-white">
            Change Profile Image
          </Button>
        </CardHeader>
      </div>

      {/* Popup Form for Image Upload */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <form onSubmit={handleImageUpload} className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl mb-4">Upload New Profile Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
              required
            />
            <div className="flex justify-between mt-4">
              <Button type="submit" className="bg-green-500 text-white">Upload</Button>
              <Button type="button" className="bg-red-500 text-white" onClick={() => setIsPopupOpen(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <Card className="m-4 w-full md:max-w-4xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="hidden">
          <Input id="userId" readOnly value={user.id} placeholder="UserId" />
        </CardContent>
        <CardContent>
          <Input id="username" readOnly value={user.name} placeholder="Username" />
        </CardContent>
        <CardContent>
          <Input id="phoneNumber" readOnly value={user.phoneNumber} placeholder="phoneNumber" />
        </CardContent>

        <CardFooter className="flex w-full flex-col md:flex-row gap-2 md:gap-4 justify-end px-5">
          <p>Want to update?
          </p>
          <Button onClick={handleClick} className="w-full md:w-32 bg-green-500 mt-4 md:mt-0">
            Update User
          </Button>

          <Button onClick={handleDelete} className="w-full md:w-40 bg-red-500 hover:bg-red-600 mt-4 md:mt-0">
            Account Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}