// todo :
// Endpoint to add task
// endpoint to delete\uptade
// endpoint to get

import { NextResponse } from "next/server";
import { TaskSchema } from "@/app/services/validations/task";
import { headers } from "next/headers";
import { verifyToken } from "@/app/services/jwt";
import { taskServices } from "@/app/services/taskServices";
export async function GET(req) {
  try {
    const headersList = await headers();
    let token = headersList.get("authorization");
    if (!token || !token.startsWith("Bearer")) {
      return NextResponse.json({
        success: false,
        message: "Unauthenticated",
      }, { status: 401 });
    }
    token = token.split(" ")[1];
    let decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid Token",
      }, { status: 401 });
    }
    let { searchParams } = new URL(req.url);
    let limit = parseInt(searchParams.get("limit")) || 10;
    let skip = parseInt(searchParams.get("skip")) || 0;
    let tasks = await taskServices.getTasks(decoded.id, limit, skip);
    
    return NextResponse.json({
      success: true,
      tasks: tasks
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    let token = req.headers.get("authorization");
    if (!token || !token.startsWith("Bearer ")) {
      return NextResponse.json({
        success: false,
        message: "Unauthenticated",
      }, { status: 401 });
    }
    token = token.split(" ")[1];
    let decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid Token",
      }, { status: 401 });
    }

    let { title, desc } = await req.json();
    let res = TaskSchema.safeParse({
      title,
      desc
    });
    if (!res.success) {
      return NextResponse.json({
        success: false,
        message: res.error.issues[0]?.message
      }, { status: 400 });
    }
    let data = res.data;
    let task = await taskServices.addTask(decoded.id, data.title, data.desc);

    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
