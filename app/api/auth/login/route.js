import { NextResponse } from "next/server";
import authServices from "@/app/services/authServices";
import { cookies } from "next/headers";
import { LoginSchema } from "@/app/services/validations/user";
export async function POST(req) {
  try {
    let user = await req.json();
    let res=LoginSchema.safeParse({
        email:user.email,
        password:user.password
    })

    if(!res.success){
        return NextResponse.json({
            success:false,
            error:res.error.issues[0]?.message,
        }, { status: 400 })
    }
    
    let data=res.data
    let response = await authServices.login(data.email, data.password);

    if (!response.success) {
      return NextResponse.json(
        {
          success: false,
          message: response.message,
        },
        { status: 400 },
      );
    }

    let cookieStore = await cookies();

    cookieStore.set({
      name: "refreshToken",
      value: response.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: response.user,
      token: response.token,
    });
  } catch (error) {
    console.error("Login Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
