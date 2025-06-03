import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import Course from '@/models/course';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const { id } = params;

  // Find user by username
  const user = (await User.findOne({ username: id }).lean()) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Find courses created by this user
  const courses = await Course.find({ creator: user._id })
    .select('_id title description genre level predictedTime')
    .lean();

  return NextResponse.json({
    username: user.username,
    memberSince: user.createdAt?.toISOString().split('T')[0],
    userScore: user.userScore,
    createdCourses: courses,
  });
}