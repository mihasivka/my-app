import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import Course from '@/models/course';
import jwt from 'jsonwebtoken';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();
  const { id } = params;

  // Authenticate moderator/admin
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

  // Check if the user is a moderator or admin
  const requestingUser = await User.findById(decoded.userId);
  if (!requestingUser || (requestingUser.role !== 'moderator' && requestingUser.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Find the user by username
  const userToDelete = await User.findOne({ username: id });
  if (!userToDelete) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Delete all courses created by this user
  await Course.deleteMany({ creator: userToDelete._id });

  // Delete the user
  await User.findByIdAndDelete(userToDelete._id);

  return NextResponse.json({ message: 'User and all their courses deleted.' }, { status: 200 });
}