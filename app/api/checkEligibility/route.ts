import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/services/db';
import { UserProgress, CourseDetails } from '@/services/schema';
import { and, eq } from 'drizzle-orm';

// Helper to get progress map (copied from /api/progress/route.ts)
async function getProgressMap(userId: string, courseId: string) {
  const progress = await db
    .select()
    .from(UserProgress)
    .where(
      and(
        eq(UserProgress.userId, userId),
        eq(UserProgress.courseId, courseId)
      )
    );
  const progressMap: Record<string, boolean> = {};
  progress.forEach((item) => {
    const lessonKey = `${item.chapterTitle}__${item.subtopicName}`;
    progressMap[lessonKey] = item.isWatched || false;
  });
  return progressMap;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }
    // Get progress map
    const progressMap = await getProgressMap(userId, courseId);
    const completedLessons = Object.values(progressMap).filter(Boolean).length;
    // Fetch course roadmap to get total lessons
    const courseRows = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.courseId, courseId));
    if (!courseRows.length) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    let totalLessons = 0;
    try {
      const roadmap = typeof courseRows[0].roadmap === 'string' ? JSON.parse(courseRows[0].roadmap) : courseRows[0].roadmap;
      totalLessons = roadmap?.reduce((sum: number, ch: { subtopics?: { length: number }[] }) => sum + (ch.subtopics?.length || 0), 0) || 0;
    } catch {
      totalLessons = 0;
    }
    if (!totalLessons) {
      return NextResponse.json({ error: 'Course has no lessons' }, { status: 400 });
    }
    const percentCompleted = Math.round((completedLessons / totalLessons) * 100);
    if (percentCompleted !== 100) {
      return NextResponse.json({ error: 'Course not completed' }, { status: 403 });
    }
    // Success (certificate generation/email will be added later)
    return NextResponse.json({ success: true, message: 'Eligible for certificate!' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
