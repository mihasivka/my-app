import { connect } from '@/dbConfig/db';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connect();
  const { username, email, password } = await req.json();

  // Check if user already exists
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Create and save new user
  const user = new User({ username, email, password });
  await user.save();

  return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
}