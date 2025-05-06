import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
let token: string | null = null;
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
     token = request.cookies.get("token")?.value || "";
  }


  console.log("Path:", path);
  console.log("Token:", token);

  // Exclude auth/login and auth/signup routes from authentication
  if (path.startsWith("/auth/login") || path.startsWith("/auth/signup")) {
    return NextResponse.next();
  }

  // Redirect to login if no token is present
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  try {
    const secret = new TextEncoder().encode(process.env.TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role;

    console.log("User Role:", userRole, payload);

    // Check user role and restrict access to specific paths
    if (path.startsWith("/dashboard") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    if (path.startsWith("/staff") && userRole !== "staff") {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }

    if (path.startsWith("/user") && userRole !== "user") {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
  } catch (error) {
    console.error("JWT verification error:", error);
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/user/:path*", "/staff/:path*"],
};
