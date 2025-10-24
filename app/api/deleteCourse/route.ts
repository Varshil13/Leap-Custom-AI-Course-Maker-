import { db } from '@/services/db';
import { CourseDetails, CourseVideos, CourseContent, UserProgress, Certificates } from '@/services/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // Delete related data (order: progress, videos, content, certificates, then course)
    await db.delete(UserProgress).where(eq(UserProgress.courseId, courseId));
    await db.delete(CourseVideos).where(eq(CourseVideos.courseId, courseId));
    await db.delete(CourseContent).where(eq(CourseContent.courseId, courseId));
    await db.delete(Certificates).where(eq(Certificates.courseId, courseId));
    await db.delete(CourseDetails).where(eq(CourseDetails.courseId, courseId));

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
