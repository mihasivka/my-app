import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import User from '@/models/user';

export async function GET(req: NextRequest) {
  await connect();

  // Fetch all courses and populate creator's username
  const courses = await Course.find({})
    .populate({ path: 'creator', select: 'username' })
    .lean();

  // Format the response to include creator's username
  const formatted = courses.map(course => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    genre: course.genre,
    level: course.level,
    predictedTime: course.predictedTime,
    courseScore: course.courseScore,
    creator: course.creator?.username || "Unknown",
    approved: course.approved,
  }));

  return NextResponse.json({ courses: formatted }, { status: 200 });
}