import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/db";
import Course from "@/models/course";
import User from "@/models/user";

export async function GET() {
  await connect();

  // Top 3 rated courses (approved only)
  const topCourses = await Course.find({ approved: "approved" })
    .sort({ courseScore: -1 })
    .limit(3)
    .select("title courseScore")
    .lean();

  // Get all users with role 'user'
  const users = await User.find({ role: "user" }).select("username").lean();

  // For each user, calculate the average score of their courses
  const usersWithScore = await Promise.all(
    users.map(async (user) => {
      const courses = await Course.find({
        creator: user._id,
        approved: "approved",
      })
        .select("courseScore")
        .lean();
      const validScores = courses
        .map((c) => (typeof c.courseScore === "number" ? c.courseScore : null))
        .filter(
          (score): score is number =>
            score !== null && score !== undefined && score !== 0
        );
      const userScore =
        validScores.length > 0
          ? parseFloat(
              (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(
                2
              )
            )
          : 0;
      return {
        _id: user._id,
        username: user.username,
        userScore,
      };
    })
  );

  // Sort users by userScore descending and take top 3
  const topUsers = usersWithScore
    .sort((a, b) => b.userScore - a.userScore)
    .slice(0, 3);

  return NextResponse.json({
    topCourses,
    topUsers,
    message: "Home data fetched successfully",
  });
}