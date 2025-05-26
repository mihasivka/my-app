import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connect } from '@/dbConfig/db';
import User from '@/app/models/user';
import Course from '@/app/models/course'; // Make sure you have this model

export async function GET(req: NextRequest) {
  await connect();

  // Get token from cookies
  const token = req.cookies.get('token')?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all courses created by the user, including their ratings
    const courses = await Course.find({ _id: { $in: user.createdCourses } });

    // Gather all ratings from all courses
    let allScores: number[] = [];
    courses.forEach(course => {
      if (course.ratings && Array.isArray(course.ratings)) {
        allScores.push(...course.ratings.map((r: { score: number }) => r.score));
      }
    });

    // Calculate average score
    let userScore = 0;
    if (allScores.length > 0) {
      userScore = parseFloat((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2));
    }

    const memberSince = user.createdAt ? user.createdAt.toISOString().split('T')[0] : '';
    const createdCourses = user.createdCourses?.length || 0;
    const enrolledCourses = user.enrolledCourses?.length || 0;

    return NextResponse.json({
      userId: user._id,
      username: user.username,
      email: user.email,
      memberSince,
      createdCourses,
      enrolledCourses,
      userScore,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}