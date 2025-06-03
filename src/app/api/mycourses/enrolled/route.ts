import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import User from '@/models/user';

export async function GET(req: NextRequest) {
  await connect();
  const token = req.cookies.get('token')?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  // Find user and populate enrolledCourses
  const user = await User.findById(decoded.userId)
    .populate({
      path: 'enrolledCourses',
      populate: { path: 'creator', select: 'username' }
    });

  if (!user) {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  // Format courses to include creator's username
  const formatted = user.enrolledCourses.map((course: any) => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    creator: course.creator?.username || "Unknown",
  }));

  return NextResponse.json({ courses: formatted }, { status: 200 });
}