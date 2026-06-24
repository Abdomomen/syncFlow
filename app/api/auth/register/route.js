import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import authServices from "@/app/services/authServices";
import { RegisterSchema } from "@/app/services/validations/user";
export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    let result=RegisterSchema.safeParse({
        username,
        email,
        password
    })
    if(!result.success){
        return NextResponse.json({
            success:false,
            error:result.error.issues[0].message
        }, { status: 400 })
    }
    let data=result.data
    let res = await authServices.register({
      username:data.username,
      email:data.email,
      password:data.password
    });
    
    if (!res.success) {
      return NextResponse.json(
        {
          success: false,
          message: res.message,
        },
        { status: 400 },
      );
    }
    let cookieStore = await cookies();

    cookieStore.set({
      name: "refreshToken",
      value: res.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      user: res.user,
      success: true,
      token: res.token,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message
      },
      { status: 500 },
    );
  }
}
