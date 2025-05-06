

import Link from "next/link";
import React from "react";
import Image from 'next/image'
import BrandImg from "@/app/asset/Logo.jpeg"
import { Button } from "@/components/ui/button";

const PrivacyPolicy: React.FC = () => {
    return (
        <div>
            {/* Header Section */}
            <header className="h-20 flex items-center justify-center w-full shadow z-50">
                <div className=" h-20 flex items-center justify-center w-full  to-transparent shadow z-50">
                    <div className=" w-full  ">
                        <div className="max-w-7xl mx-auto flex items-center justify-center lg:justify-between px-5 text-black py-3">
                            <div className="relative">
                                <Link href="/" className="flex items-center " >
                                    <Image src={BrandImg} width={1000} height={1000} alt="Brand Logo" className="w-12 rounded-xl border-2 bg-orange-700 p-1" />
                                    {/* <span className="text-black text-xl font-bold">Epic Hair</span> */}
                                </Link>
                            </div>
                            <div className="hidden lg:block">
                                <ul className="flex gap-4 items-center">

                                    <li>
                                        <a href="#" className=" ">Home</a>
                                    </li>
                                    <li>
                                        <a href="#feature" className=" ">Feature</a>
                                    </li>

                                    <li>
                                        <a href="#faq" >FAQ</a>
                                    </li>

                                    <li>
                                        <Link href="/" >
                                            <Button className="bg-orange-700 hover:bg-orange-600 ">Download Now</Button></Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Privacy Policy Section */}
            <main className="bg-gray-50 min-h-screen py-8">
                <div className="bg-gray-50 min-h-screen py-8">
                    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-600">
                        Last Updated: 26/02/25
                        </p>

                        {/* Introduction */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Introduction</h2>
                            <p className="text-gray-600">
                            Welcome to the Epic Hair Application (&qout;we,&qout; &qout;our,&qout; or &qout;us&qout;). Your privacy is important to us, and we are committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.

                            </p>
                        </section>

                        {/* Data Collection and Usage */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            1. Information We Collect
                            </h2>
                            <p className="text-gray-600">
                            When you create an account on Epic Hair, we collect the following information:

Mobile Number: Required for account creation and verification.
Profile Picture (Optional): Users can upload a profile picture for personalization.
Name: Used for display within the app.

                            </p>
                        </section>

                        {/* Security Measures */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            2. How We Use Your Information
                            </h2>
                            <p className="text-gray-600">
                            We use your data to:

Provide account authentication and secure access to the app.
Improve user experience and personalize the app.
Ensure compliance with applicable laws and regulations.

                            </p>
                        </section>

                        {/* Permissions */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">3. Permissions Used</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Our app requests the following permissions:</li>
                                <li>Internet Access (android.permission.INTERNET): Required for account creation, profile uploads, and app functionality.
                                </li>
                            </ul>
                        </section>

                        {/* Children’s Privacy */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">4. Data Security
                            </h2>
                            <p className="text-gray-600">
                            We take appropriate security measures to protect your personal data. However, no method of transmission over the internet is 100% secure.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">5. Data Sharing
                            </h2>
                            <p className="text-gray-600">
                            We do not sell, rent, or share your personal data with third parties for marketing purposes. Your data is only used to provide and improve our services.

                            </p>
                        </section>

                        {/* Updates to This Privacy Policy */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            6. Children&apos;s Privacy
                            </h2>
                            <p className="text-gray-600">
                            Our app is intended for users aged 13 and above. We do not knowingly collect data from children under 13. If you believe a child has provided personal information, please contact us to remove it.
                            </p>
                        </section>

                        {/* Contact Us */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">7. Updates to This Privacy Policy
                            </h2>
                            <p className="text-gray-600">
                            We may update this policy from time to time. Any changes will be communicated within the app.
                            </p>
                           
                        </section>
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">8. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions or concerns, reach out to us at:
                            </p>
                            <ul className="list-disc list-inside text-gray-600">
                                <li>Email: <a href="mailto:epic.hair.support@gmail.com" className="text-blue-500 underline">📧 Email: epic.hair.support@gmail.com
                                </a></li>
                            </ul>
                        </section>

                        {/* Disclaimer */}
                        {/* <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Disclaimer</h2>
                            <p className="text-gray-600">
                                This app is provided &quot;as is&quot; without any warranties. We are not
                                liable for any issues arising from the use of the app. Users are
                                encouraged to use the app at their own risk.
                            </p>
                        </section> */}

                       

                        

                        
                    </div>
                </div>
            </main>

            {/* Footer Section */}
            <footer className="h-24 flex text-center items-center bg-orange-700">
                <div className="max-w-7xl mx-auto">
                    <div className="w-full flex flex-col text-white justify-between items-center gap-2">
                        <p className="text-base">
                            © 2024 EpicHair. All Rights Reserved. Developed by{" "}
                            <a
                                className="underline"
                                href="https://www.noblessetech.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Noblessetech
                            </a>
                        </p>
                        <div className="flex gap-3">
                            <Link className="underline" href="/privacy-policy">
                                Privacy Policy
                            </Link>
                            <Link className="underline" href="/delete-account">
                                Delete Account
                            </Link>
                            <Link className="underline" href="/about">
                                About
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
