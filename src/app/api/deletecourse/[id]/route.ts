import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import User from '@/models/user';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

  // Remove course from user's createdCourses
  await User.findByIdAndUpdate(decoded.userId, {
    $pull: { createdCourses: courseId }
  });

  // Delete the course itself
  await Course.findOneAndDelete({ _id: courseId, creator: decoded.userId });

  return NextResponse.json({ message: 'Course deleted' }, { status: 200 });
}