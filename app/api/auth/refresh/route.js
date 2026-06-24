import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "@/app/services/jwt";

export async function POST(req) {
  try {
    let cookieStore = await cookies();
    let refreshToken = await cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "UnAuthorized",
        },
        { status: 401 },
      );
    }
    let decoded = verifyRefreshToken(refreshToken);

    if (!decoded || !decoded.id) {
      return NextResponse.json({
        success: false,
        message: "session expired",
      }, { status: 401 });
    }
    let newToken = generateToken(decoded);
    let newRefreshToken = generateRefreshToken(decoded);
    cookieStore.set({
      name: "refreshToken",
      value: newRefreshToken, 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, 
      path: "/",
    });
    return NextResponse.json({
      success: true,
      token: newToken,
      user:decoded
    });
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({
        success:false,
        message:error.message || "Internal Server Error"
    })
  }
}
