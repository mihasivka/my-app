import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import User from '@/app/models/user';
import Course from '@/app/models/course';

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

  // Find user and populate createdCourses
  const user = await User.findById(decoded.userId).populate('createdCourses');
  if (!user) {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  // Return the courses
  return NextResponse.json({ courses: user.createdCourses }, { status: 200 });
}