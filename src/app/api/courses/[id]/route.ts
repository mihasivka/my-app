import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';


export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connect();
  const { id } = await context.params; // <-- await params

  try {
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ course }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connect();
  const { id } = await context.params;

  // Optional: Authenticate user and check if they are the creator
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

  // Only allow the creator to edit
  const course = await Course.findById(id);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }
  if (String(course.creator) !== decoded.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  course.title = title;
  course.description = description;
  course.genre = category;
  course.level = difficulty;
  course.predictedTime = length;
  await course.save();

  return NextResponse.json({ message: 'Course updated successfully' }, { status: 200 });
}