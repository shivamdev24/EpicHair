import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import Service from "@/models/Service";

// Connect to the database
db();

const verifyToken = (request: NextRequest) => {
  const authHeader = request.headers.get("Authorization");
  let token: string | null = null;

  // Check Authorization header first
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = request.cookies.get("token")?.value || null;
  }

  // Check if token is available
  if (!token) {
    throw new Error("Authorization token is required.");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET || "default_secret_key"
    );

    if (typeof decoded !== "string" && (decoded as JwtPayload).id) {
      return decoded; // Return the full decoded object
    } else {
      throw new Error("Invalid token payload.");
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token.", { cause: error });
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired.", { cause: error });
    } else {
      throw new Error("Token verification failed.", { cause: error });
    }
  }
};

// GET: Fetch all services
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);

    // Check if user is authenticated and is an admin
    if (!user ) {
      return NextResponse.json(
        { message: "Authorization required to access services." },
        { status: 401 }
      );
    }

    const services = await Service.find(); // Fetch all services
    console.log(services);
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Failed to fetch services." },
      { status: 500 }
    );
  }
}
