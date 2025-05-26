import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/db';
import Course from '@/app/models/course';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  await connect();
  const { id } = context.params; // <-- await params

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