import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params; // <-- Await params

  try {
    const course = await Course.findById(id).lean();
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Calculate average rating (courseScore) from ratings array
    let courseScore = null;
    const typedCourse = course as typeof course & { ratings?: { score: number }[] };
    if (typedCourse.ratings && typedCourse.ratings.length > 0) {
      const validRatings = typedCourse.ratings
        .map((r: any) => typeof r.score === "number" ? r.score : null)
        .filter((score: number | null) => score !== null && score !== 0);
      if (validRatings.length > 0) {
        courseScore =
          validRatings.reduce((a: number, b: number) => a + b, 0) /
          validRatings.length;
      }
    }

    return NextResponse.json(
      { course: { ...course, courseScore } },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connect();
  const { id } = context.params;

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

  // Get all fields, including approved
  const { title, description, category, difficulty, length, approved } = await req.json();

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
  course.approved = approved;

  await course.save();

  return NextResponse.json({ message: 'Course updated successfully' }, { status: 200 });
}