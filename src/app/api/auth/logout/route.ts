



import db from "@/utils/db";
import { NextResponse } from "next/server";

db();

export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout Successfully",
      success: true,
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/", 
      expires: new Date(0), 
    });

    console.log("Logout response:", response);

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
