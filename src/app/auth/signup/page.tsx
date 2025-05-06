


"use client";


import {  useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const [user, setUser] = useState({
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
 

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the state
  };

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    setLoading(true);
    setErrorMessage(""); // Clear any previous error messages
    if (!user.phoneNumber || !user.password) {
      setErrorMessage("Both email and password fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user), // Send user data in the request body
      });

      if (response.ok) {
        console.log("Sent verification Otp Successfully.", response);
        const encodedPhoneNumber = encodeURIComponent(user.phoneNumber);
        router.push(`/auth/signup/verifyotp?phoneNumber=${encodedPhoneNumber}`);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message ); // Display error message
      }

     
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Signup failed:", error); // Log the error for debugging
      setErrorMessage(
        error.response?.data?.message || "An error occurred during Signup." // Display error message
      );
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  

  return (
    <div className="flex mx-auto flex-col justify-center items-center h-screen relative px-5">
      <div>
        {loading ? (
          <p className="flex mx-auto h-screen w-screen absolute top-0 left-0 bg-white justify-center items-center z-50 text-6xl">
            <HashLoader
              color="#000"
              loading={loading}
              size={80}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </p>
        ) : ""}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <Card className="w-full p-8 flex mx-auto flex-col justify-center items-center ">
          <CardHeader className="w-full">
            <CardTitle>Signup</CardTitle>
            <CardDescription>Create Your Admin Account</CardDescription>
          </CardHeader>
            <CardContent className="w-full">
          <form onSubmit={onSignIn} className="flex flex-col gap-4 w-full">
              <Input
                placeholder="+919999999999"
                type="text"
                value={user.phoneNumber}
                aria-autocomplete="none"
                onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
              />
            
            
              <div className="flex justify-between relative"> {/* Wrapper to position the toggle icon */}
                <Input
                  placeholder="Password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"} // Conditional input type
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  
                />

                {/* Toggle button or icon */}
                <button
                  type="button"
                  className="absolute right-2 top-2" // Position the button inside the input
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <Eye /> : <EyeOff />} {/* Change icon based on state */}
                </button>
              </div>
              
            
              <Button
                className="w-full"
                type="submit"
               
                
              >Signup
              </Button>
           
          </form>
          </CardContent>
          <Separator />
          <CardFooter className="mt-4 flex gap-3">

            <p>Already have an account? </p>
            <Link
              className="text-blue-500 underline hover:text-gray-900 duration-500"
              href="/auth/login"
            >
              Login here.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


