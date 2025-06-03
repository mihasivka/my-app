import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import User from '@/models/user';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  const token = req.cookies.get('token')?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const courseId = params.id;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Add course to user's enrolledCourses if not already enrolled
  await User.findByIdAndUpdate(
    decoded.userId,
    { $addToSet: { enrolledCourses: courseId } }
  );

  return NextResponse.json({ message: 'Enrolled successfully' }, { status: 200 });
}