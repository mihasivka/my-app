import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import User from '@/models/user';

export async function POST(req: NextRequest) {
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

  const { title, description, category, difficulty, length } = await req.json();

  // Create the course
  const course = new Course({
    title,
    description,
    genre: category,
    predictedTime: length,
    level: difficulty,
    creator: decoded.userId,
  });
  await course.save();

  // Add course to user's createdCourses
  await User.findByIdAndUpdate(decoded.userId, {
    $push: { createdCourses: course._id }
  });

  return NextResponse.json({ message: 'Course created', courseId: course._id }, { status: 201 });
}