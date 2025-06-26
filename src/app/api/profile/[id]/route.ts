import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/db";
import User from "@/models/user";
import Course from "@/models/course";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  // Find user by username or ID
  const user = await User.findOne({ username: id })
    .populate({
      path: "createdCourses",
      select: "title description genre level predictedTime courseScore approved",
    })
    .lean() as any;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Format createdCourses to include approved
  const createdCourses = (Array.isArray(user.createdCourses) ? user.createdCourses : []).map((course: any) => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    courseScore: course.courseScore ?? 0,
    approved: course.approved,
  }));

  // Calculate userScore as average of approved courses' courseScore
  // Only count courses that are approved AND have a courseScore > 0
  const approvedCourses = createdCourses.filter(
    (c: { approved: string; courseScore: number }) =>
      c.approved === "approved" && typeof c.courseScore === "number" && c.courseScore > 0
  );

  const userScore =
    approvedCourses.length > 0
      ? approvedCourses.reduce(
          (sum: number, c: { courseScore: number }) => sum + c.courseScore,
          0
        ) / approvedCourses.length
      : null;

  return NextResponse.json({
    username: user.username,
    memberSince: user.createdAt,
    userScore,
    createdCourses,
    // ...other user fields
  });
}