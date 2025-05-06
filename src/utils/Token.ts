import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

// export const verifyToken = (request: NextRequest) => {
  
//   const authHeader = request.headers.get("Authorization");
//   let token: string | null = null;
//   if (!authHeader) {
//     throw new Error("Authorization token is required.");
//   }

//   // Check Authorization header first
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     token = authHeader.split(" ")[1];
//   } else {
//     token = request.cookies.get("token")?.value || null;
//   }
  
 

//   if (!token) {
//     console.warn("No authorization token found.");
//     return null;
//   }

//   try {
//     // Verify the token and decode it
//     const decoded = jwt.verify(
//       token,
//       process.env.TOKEN_SECRET || "default_secret_key"
//     ) as JwtPayload;

//     // Check if the decoded token contains an ID
//     if (decoded && decoded.id) {
//       return decoded as JwtPayload;
//     } else {
//       throw new Error("Invalid token payload.");
//     }
//   } catch (error) {
//     console.error("Token verification error:", { cause: error });

//     // If the token is expired or invalid, clear the cookie
//     if ((error as Error).name === "TokenExpiredError") {
//       // Set the token cookie to empty to clear it
//       return NextResponse.json(
//         {
//           message: "token error",
//         },
//         {
//           status: 401,
//           headers: {
//             "Set-Cookie": "token=; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
//           },
//         }
//       );
//     }

//     return null;
//   }
// };



 export const verifyToken = (request: NextRequest) => {
   const authHeader = request.headers.get("Authorization");
   let token: string | null = null;

   if (authHeader && authHeader.startsWith("Bearer ")) {
     token = authHeader.split(" ")[1];
   } else {
     token = request.cookies.get("token")?.value || null;
   }

   if (!token) {
     throw new Error("Authorization token is required.");
   }

   try {
     const decoded = jwt.verify(
       token,
       process.env.TOKEN_SECRET || "default_secret_key"
     );

     if (typeof decoded !== "string") {
       return decoded as JwtPayload;
       throw new Error("Invalid token payload.");
     }
   } catch (error) {
      if ((error as Error).name === "TokenExpiredError") {
        // Set the token cookie to empty to clear it
        return NextResponse.json(
          {
            message: "token error",
          },
          {
            status: 401,
            headers: {
              "Set-Cookie": "token=; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
            },
          }
        );
      }


     throw new Error("Invalid token.", { cause: error });
   }
 };

