

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HashLoader from "react-spinners/HashLoader";

function VerifyOtpComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = searchParams.get("phoneNumber"); // Fetch from query params


    console.log(phoneNumber);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);

    useEffect(() => {
        if (otp.length === 6) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [otp]);

    const onVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch(`/api/auth/login/verifyOtp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ otp, phoneNumber }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push("/dashboard");
            } else {
                throw new Error(data.message || "OTP verification failed.");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred during OTP verification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex mx-auto flex-col justify-center items-center h-screen relative px-5">
            {loading && (
                <div className="flex mx-auto h-screen w-screen absolute top-0 left-0 bg-white justify-center items-center z-50 text-6xl">
                    <HashLoader
                        color="#000"
                        loading={loading}
                        size={80}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            )}
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            {!loading && (
                <Card className="max-w-4xl p-8 flex mx-auto flex-col justify-center items-center">
                    <CardHeader>
                        <CardTitle>Verify OTP</CardTitle>
                    </CardHeader>
                    <form onSubmit={onVerifyOtp}>
                        <CardContent>
                            <Input
                                placeholder="Phone Number"
                                type="text"
                                value={phoneNumber || ""}
                                disabled
                            />
                        </CardContent>
                        <CardContent>
                            <Input
                                placeholder="Enter OTP"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </CardContent>
                        <CardContent>
                            <Button className="w-full" type="submit" disabled={buttonDisabled}>
                                {buttonDisabled ? "Enter OTP" : "Verify OTP"}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            )}
        </div>
    );
}


// Wrap the component in Suspense for client-side rendering
export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<>
            <p className="flex mx-auto h-screen w-screen absolute top-0 left-0 bg-white justify-center items-center text-6xl z-50">
                <HashLoader
                    color="#000"

                    size={80}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </p></>}>
            <VerifyOtpComponent />
        </Suspense>
    );
}