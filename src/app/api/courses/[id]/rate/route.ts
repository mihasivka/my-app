import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Course from '@/models/course';
import jwt from 'jsonwebtoken';
import User from '@/models/user';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;
  const { score } = await req.json();

  // (Assuming you already verify token and decode it)
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

  const course = await Course.findById(id);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Remove previous rating by this user if exists
  course.ratings = (course.ratings || []).filter(
    (r: any) => r.rater.toString() !== decoded.userId
  );

  // Add new rating
  course.ratings.push({ rater: decoded.userId, score });

  // (Optional: If you want to update the user's ratings array as well)
  await User.findByIdAndUpdate(decoded.userId, {
    $pull: { ratings: { course: course._id } }
  });
  await User.findByIdAndUpdate(decoded.userId, {
    $push: { ratings: { course: course._id, score } }
  });

  // Recalculate the average and save it to courseScore
  const totalScore = course.ratings.reduce(
    (acc: number, cur: any) => acc + cur.score,
    0
  );
  course.courseScore = totalScore / course.ratings.length;

  await course.save();

  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connect();
  const { id } = await params;

  try {
    const courseData = await Course.findById(id)
      .populate('creator', 'username')
      .lean();

    if (!courseData || Array.isArray(courseData)) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const creatorName =
      courseData.creator &&
      typeof courseData.creator === 'object' &&
      'username' in courseData.creator
        ? courseData.creator.username
        : 'Unknown';

    return NextResponse.json({
      course: {
        ...courseData,
        creator: creatorName
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
  }
}