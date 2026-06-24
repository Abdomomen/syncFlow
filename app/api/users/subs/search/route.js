import { NextResponse } from "next/server";
import { subServices } from "@/app/services/subServices";
import { verifyToken } from "@/app/services/jwt";
import { querySchema } from "@/app/services/validations/query";
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  let token = req.headers.get("authorization");
  if (!token || !token.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  token = token.split(" ")[1];
  let user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
  }

  let query = searchParams.get("query") || "";
  let limit = searchParams.get("limit") || 10;
  let skip = searchParams.get("skip") || 0;
  let validation = querySchema.safeParse({
    query,
    limit: Number(limit),
    skip: Number(skip),
  });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 },
    );
  }
  let subs = await subServices.searchSubs(
    user.id,
    query,
    Number(limit),
    Number(skip),
  );
  return NextResponse.json({
    success: true,
    subs,
  });
}
