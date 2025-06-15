import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import Course from '@/models/course';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connect();
  const { id } = await context.params;

  // Find user by username
  const user = (await User.findOne({ username: id }).lean()) as any;
  if (!user || Array.isArray(user)) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find courses created by this user, including courseScore
  const courses = await Course.find({ creator: user._id })
    .select('_id title description genre level predictedTime courseScore creator')
    .lean();

  // Calculate userScore: average of all courseScores, excluding 0.0 and null/undefined
  const validScores = (courses as any[])
    .map(c => typeof c.courseScore === "number" ? c.courseScore : null)
    .filter((score): score is number => score !== null && score !== undefined && score !== 0);

  const userScore =
    validScores.length > 0
      ? parseFloat(
          (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
        )
      : null;

  return NextResponse.json({
    username: user.username,
    memberSince: user.createdAt ? user.createdAt.toISOString().split('T')[0] : null,
    userScore,
    createdCourses: courses,
  });
}