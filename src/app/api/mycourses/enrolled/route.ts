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

  // Get the user so we know which courses they are enrolled in.
  const user = await User.findById(decoded.userId);
  if (!user || !user.enrolledCourses) {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }

  // Find courses that the user is enrolled in, selecting courseScore and other needed fields.
  const enrolledCourses = await Course.find({
    _id: { $in: user.enrolledCourses },
  }).select('title description genre level predictedTime courseScore creator')
    .populate({ path: 'creator', select: 'username' });

  const formattedCourses = enrolledCourses.map((course: any) => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    // If courseScore is available use it; otherwise default to 0.
    courseScore: course.courseScore !== undefined && course.courseScore !== null
      ? course.courseScore
      : 0,
    creator: course.creator?.username || "Unknown",
  }));

  return NextResponse.json({ courses: formattedCourses }, { status: 200 });
}