/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image";
import Logo from "@/app/asset/Logo.jpeg"





interface Profile {
  image_url: string;
}

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile>()

  const [loading, setLoading] = useState(true); // Add loading state

  // Check if the current path is '/' or starts with '/auth'
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return null; // Do not render the Sidebar
  }


  useEffect(() => {
    const getUserDetails = async () => {
      setLoading(true); // Set loading to true when starting to fetch data
      try {
        const response = await fetch("/api/admin/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const data = await response.json();
        setProfile(data.user);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    getUserDetails();
  }, []);


  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST", // Ensure that the method is POST
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      const data = await response.json();
      console.log(data.message);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Appointments", href: "/dashboard/appointments" },
    { name: "User", href: "/dashboard/user" },
    { name: "Service", href: "/dashboard/service" },
    { name: "Staff", href: "/dashboard/staff" },
  ];



  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  return (
    <div>
      <div className="w-screen h-20 bg-gray-900 text-white drop-shadow-md flex justify-between px-5 items-center">
         


        <div className="md:hidden">
          <Sheet >

            <SheetTrigger> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg></SheetTrigger>


            <SheetContent>
              <ul className="flex flex-col gap-3 mt-6">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block py-2 px-4 ${pathname === item.href ? "font-bold text-yellow-600" : ""
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="w-full flex justify-start px-5 items-center"><div className="hidden md:block"> 
          <Image src={Logo} width={1000} height={1000} alt="Brand Logo" className="w-12 rounded-xl border-2 p-1" />
        </div>
          <div className="p-4 hidden md:block">
            <ul className="flex ">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 px-4 ${pathname === item.href ? "font-bold text-yellow-600" : ""
                      }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Link>

        <div className="">
          
          <Menubar>
            <MenubarMenu >
              <MenubarTrigger className="rounded-full bg-none">
                <Avatar className="border-2">
                  <AvatarImage src={profile?.image_url || '/default-avatar.png'} className="object-cover object-center" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              </MenubarTrigger>
              <MenubarContent>
                <Link href="/dashboard/profile">
                  <MenubarItem>
                    Profile <MenubarShortcut>⌘</MenubarShortcut>
                  </MenubarItem></Link>
                <MenubarItem onClick={logout}>
                  <span>Logout</span> <span> <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-log-out"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg></span>
                </MenubarItem>
                
              </MenubarContent>
            </MenubarMenu>
          </Menubar>


          
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
