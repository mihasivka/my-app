import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req :Request) {
  await connect();
  const { email, password } = await req.json();
  const user = await User.findOne({ email, password }); // In production, use hashed passwords!
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return NextResponse.json({ token }, { status: 200 });
}

