import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/db";
import Course from "@/models/course";

export async function GET() {
  await connect();

  // Only fetch courses with approved: 'pending'
  const pendingCourses = await Course.find({ approved: 'pending' })
    .populate({ path: "creator", select: "username" })
    .lean();

  const formatted = pendingCourses.map(course => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    courseScore: course.courseScore,
    creator: course.creator?.username || "Unknown",
    approved: course.approved,
  }));

  return NextResponse.json({ courses: formatted }, { status: 200 });
}