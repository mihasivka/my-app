import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/db";
import Course from "@/models/course";
import jwt from "jsonwebtoken";
import User from "@/models/user";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params; // ✅ Await params

  // Authenticate user
  const token = req.cookies.get("token")?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check if user is moderator or admin
  const user = await User.findById(decoded.userId);
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get approved value from request body
  const { approved } = await req.json();
  if (!["approved", "denied", "pending"].includes(approved)) {
    return NextResponse.json({ error: "Invalid approved value" }, { status: 400 });
  }
  // Update course
  const course = await Course.findById(id);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  course.approved = approved;
  await course.save();

  return NextResponse.json({ message: "Course approval updated" }, { status: 200 });
}