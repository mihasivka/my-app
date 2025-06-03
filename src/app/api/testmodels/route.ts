import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Course from '@/models/course';
import User from '@/models/user';


// Testing for issues with the models not being registered

export async function GET() {
  try {
    // This will throw if not registered
    mongoose.model('Course', Course.schema);
    mongoose.model('User', User.schema);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}