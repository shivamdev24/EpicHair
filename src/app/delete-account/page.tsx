"use client"

import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import SectionWrapper from "@/components/SectionWrapper"
import BGimg from "@/app/asset/bgimg.jpg"
import Image from 'next/image'
import BrandImg from "@/app/asset/Logo.jpeg"
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-menubar'

const DeleteAccountPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [isOtpExpired, setIsOtpExpired] = useState(false);

    // Start the timer when OTP is sent
    useEffect(() => {
        if (timer > 0 && !isOtpExpired) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setIsOtpExpired(true); // OTP expired
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval); // Cleanup on component unmount
        }
    }, [timer, isOtpExpired]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        const response = await fetch("/api/deleteAccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ phoneNumber }),
        });

        console.log("response data", phoneNumber);
        console.log("response data", response);
        if (response.ok) {
            const data = await response.json();
            console.log("Account Delete OTP sent successfully.", data);
            setOtpSent(true);
            setIsOtpExpired(false); // Reset expired flag if OTP is sent again
            setTimer(120);  // Start a 2-minute timer
            alert(`${data.message} ${phoneNumber}.`);
        } else {
            const errorData = await response.json();
            console.log("An error occurred while sending OTP for account deletion", errorData);
            alert(`${errorData.message} ${phoneNumber}.`);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the account associated with ${phoneNumber}? This action cannot be undone.`
        );

        if (isConfirmed) {
            try {
                const response = await fetch("/api/deleteAccount/verifyDelete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ phoneNumber, otp }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Account Delete successfully.", data);
                    setOtp("")
                    setPhoneNumber("")
                    alert(`Account associated with ${phoneNumber} has been deleted successfully.`);
                } else {
                    const errorData = await response.json();
                    console.log(errorData.message || "An error occurred during Account Deletion.");
                    alert(errorData.message || "Failed to delete account.");
                }
            } catch (error) {
                console.error("An unexpected error occurred. Please try again.", error);
                alert("Account deletion was canceled due to an error.");
            }
        } else {
            alert("Account deletion was canceled.");
        }
    };

    return (
        <main className='relative bg-gray-50'>
            <div className="h-20 flex items-center justify-center w-full to-transparent backdrop-blur-md z-50">
                <div className="w-full">
                    <div className="max-w-7xl mx-auto flex items-center justify-center lg:justify-between px-5 text-black py-3">
                        <div className="relative">
                            <Link href="/" className="flex items-center">
                                <Image src={BrandImg} width={1000} height={1000} alt="Brand Logo" className="w-12 rounded-xl border-2 bg-orange-700 p-1" />
                            </Link>
                        </div>
                        <div className="hidden lg:block">
                            <ul className="flex gap-4 items-center">

                                <li>
                                    <Link href="/" className=" ">Home</Link>
                                </li>
                                

                                <li>
                                    <Link href="/" >
                                        <Button className="bg-orange-500 hover:bg-orange-600 ">Download Now</Button></Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <section className='relative h-[100vh] flex justify-center items-center overflow-hidden px-5'>
                <Image src={BGimg} alt="bg image" className='w-full absolute h-[100vh] object-cover top-0 left-0 z-10' />
                <div className='w-full absolute top-0 left-0 z-20 bg-black opacity-50 h-screen' />
                <div className="custom-screen py-28 text-white z-30">
                    <div className="space-y-5 max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl text-white font-extrabold mx-auto sm:text-6xl">
                            Delete Your Account
                        </h1>
                        <p className="max-w-xl mx-auto">
                            Are you sure you want to delete your account? Please verify your phone number and enter the OTP to confirm.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-5">
                <div className="max-w-7xl mx-auto py-10">

                    <SectionWrapper className="border p-4 rounded-lg shadow bg-white">
                        <div className="space-y-4">
                            <div className="mb-4">
                            <div className="mb-4">
                                <Label className="block text-black text-sm font-semibold" >
                                    Phone Number
                                </Label>
                                <Input
                                    type="text"
                                    id="phoneNumber"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full p-3 mt-2 rounded-md text-black"
                                    placeholder="Phone number with country code"
                                />
                            </div>
                               <div className="flex gap-4">
                                    <Button onClick={handleSendOtp} className="bg-blue-600 hover:bg-blue-800 text-white" disabled={otpSent && !isOtpExpired}>
                                        Send OTP
                                    </Button>
                                    {otpSent && !isOtpExpired && (
                                        <div className="text-center text-black mt-3">
                                            <p>Resend OTP in remaining Time: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</p>
                                        </div>
                                    )}
                               </div>
                            </div>
                            <div className="mb-4">
                                <Label className="block text-black text-sm font-semibold" >
                                    OTP
                                </Label>
                                <Input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full p-3 mt-2 rounded-md text-black"
                                    placeholder="Enter OTP"
                                />
                            </div>

                            <div className="flex gap-4 justify-center">
                               
                                <Button onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white" disabled={!otpSent || isOtpExpired}>
                                    Delete Account
                                </Button>
                            </div>

                            {/* Display remaining time for OTP */}
                            {otpSent && !isOtpExpired && (
                                <div className="text-center text-black mt-3">
                                    <p>Send OTP in remaining Time: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</p>
                                </div>
                            )}

                            {isOtpExpired ? (
                                <div className="text-center text-red-500 mt-3">
                                    <p>Your OTP has expired. Please request a new OTP.</p>
                                    
                                </div>
                            ):""}
                        </div>
                    </SectionWrapper>
                </div>
            </section>
            <section className='h-full py-10 px-5 flex text-center  items-center bg-orange-500'>
                <div className=' max-w-7xl mx-auto font-bold'>
                    <div className="w-full flex flex-col text-white justify-between items-center gap-2">
                        <p className='text-xs lg:text-base'>copyright © 2024 EpicHair All Rights Reserved. Developed By <a className='underline' href="https://www.noblessetech.com/">Noblessetech</a> </p>

                        <div className='flex gap-3 text-xs lg:text-base'>
                            <Link className='underline' href="/privacy-policy">Privacy Policy</Link>
                            <Link className='underline' href="/delete-account">Delete Account</Link>
                            <Link className="underline" href="/about">
                                About
                            </Link>
                        </div>


                    </div>
                </div>

            </section>
        </main>
    );
};

export default DeleteAccountPage;



