

"use client";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import HashLoader from "react-spinners/HashLoader";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  console.log({ phoneNumber, password });

  const [buttonDisabled, setButtonDisabled] = useState({
    login: true,
    otp: true,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  

  const router = useRouter();

  useEffect(() => {
    if (phoneNumber.length > 0 && password.length > 0) {
      setButtonDisabled({ login: false, otp: false }); // Enable both buttons
    } else if (phoneNumber.length > 0 && password.length === 0) {
      setButtonDisabled({ login: true, otp: false }); // Enable only OTP button
    } else {
      setButtonDisabled({ login: true, otp: true }); // Disable both buttons
    }
  }, [phoneNumber, password]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    setLoading(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      const response = await fetch("/api/admin/auth/loginwithPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }), // Send email and password in the body
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Sent verification Otp successfully.", data);
        router.push(`/dashboard`); // Redirect to the dashboard on success
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "An error occurred during login.");
      }
    } catch (error) {
      console.error("Login failed:", error); // Log the error for debugging
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const onOtpLogin = async () => {
    // Redirect to the OTP verification route
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }), // Send user data in the request body
      });

      if (response.ok) {
        // Successful response, redirect to OTP verification
        router.push(`/auth/login/verifyotp?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      } else {
        // If the response is not ok, handle error
        const errorData = await response.json();
        setErrorMessage(errorData.message || "An error occurred during login.");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
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
            <CardTitle>Login</CardTitle>
            <CardDescription>Login Into Your Admin Account</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <form onSubmit={onSignIn} className="w-full flex flex-col gap-4">
              <Input
                placeholder="Phone Number"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />

              <div className="flex justify-between relative">
                <Input
                  placeholder="Password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"} // Toggle between text and password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2  text-gray-600"
                  onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={buttonDisabled.login}
              >
                {buttonDisabled.login ? "Required Field" : "Login"}
              </Button>
            </form>
          </CardContent>
          <Separator />
          <CardContent className="w-full mt-4">
            <Button
              disabled={buttonDisabled.otp}
              className="w-full bg-blue-500"
              onClick={onOtpLogin}
            >
              {buttonDisabled.otp ? "Required Field" : "Login With OTP"}
            </Button>
          </CardContent>
          <CardFooter className="mt-4 flex gap-3">
            <p>Don&apos;t have an account? </p>
            <Link
              className="text-blue-500 underline hover:text-gray-900 duration-500"
              href="/auth/signup"
            >
              Signup here.
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}