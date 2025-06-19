import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const { id: courseId } = params;

  const token = req.cookies.get('token')?.value;
  if (!token || !process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Remove the course from the user's enrolledCourses array using $pull.
  const updatedUser = await User.findByIdAndUpdate(
    decoded.userId,
    { $pull: { enrolledCourses: courseId } },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}