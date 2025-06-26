import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import Course from '@/models/course';

export async function GET() {
  await connect();

  // Find users with role 'user'
  const users = await User.find({ role: 'user' }).lean();

  // For each user, calculate userScore from only approved courses
  const usersWithScores = await Promise.all(
    users.map(async (user) => {
      // Only get approved courses
      const courses = await Course.find({ creator: user._id, approved: "approved" }).lean();
      if (!courses.length) return null; // skip users with no approved courses

      // Calculate userScore as average of all approved courseScores (excluding 0)
      const validScores = courses
        .map(c => typeof c.courseScore === "number" && c.courseScore !== 0 ? c.courseScore : null)
        .filter((score): score is number => score !== null && score !== undefined);

      const userScore =
        validScores.length > 0
          ? parseFloat(
              (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
            )
          : null;

      return {
        username: user.username,
        userScore,
        createdCourses: courses.length,
      };
    })
  );

  // Filter out users with no approved courses or no score, then sort and take top 3
  const topUsers = usersWithScores
    .filter(Boolean)
    .filter(u => u!.userScore !== null)
    .sort((a, b) => (b!.userScore! - a!.userScore!))
    .slice(0, 3);

  return NextResponse.json({ topUsers });
}