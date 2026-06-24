// edit & delete

import { NextResponse } from "next/server"; 
import { verifyToken } from "@/app/services/jwt";
import { TaskSchema } from "@/app/services/validations/task";
import { taskServices } from "@/app/services/taskServices";

export async function PUT(req, { params }) {
  try {
    let { id } = await params;
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

    let task = await taskServices.editTask(decoded.id, data.title, data.desc, id);

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

export async function DELETE(req, { params }) {
  try {
    let { id } = await params;
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
    let del = await taskServices.deleteTask(decoded.id, id);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    let { id } = await params;
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
    let task = await taskServices.toggleComplete(decoded.id, id);

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