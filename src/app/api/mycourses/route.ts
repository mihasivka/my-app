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

  // Find user and populate createdCourses with the fields we need.
  // Here we populate the 'creator' field so we can later display the username.
  const user = await User.findById(decoded.userId).populate({
    path: 'createdCourses',
    select: 'title description genre level predictedTime courseScore creator approved',
    populate: { path: 'creator', select: 'username' },
  });
  if (!user) {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  // Format the courses if needed (for example, mapping creator to a string)
  const formattedCourses = user.createdCourses.map((course: any) => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    courseScore: course.courseScore ?? 0,
    creator: course.creator?.username || "Unknown",
    approved: course.approved,
  }));

  return NextResponse.json({ courses: formattedCourses }, { status: 200 });
}