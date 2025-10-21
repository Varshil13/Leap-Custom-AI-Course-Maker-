import { NextRequest, NextResponse } from "next/server";
// Adjust these imports as needed for your project structure
import { db } from "@/services/db";
import { UserProgress } from "@/services/schema";
import { eq, and } from "drizzle-orm";
// If using Clerk for auth:
import { auth } from "@clerk/nextjs/server";

// GET: Load user progress for a course
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const progress = await db
      .select()
      .from(UserProgress)
      .where(
        and(
          eq(UserProgress.userId, userId),
          eq(UserProgress.courseId, courseId)
        )
      );

    // Format: { "chapter__subtopic": true/false, ... }
    const progressMap: Record<string, boolean> = {};
    progress.forEach((item) => {
      const lessonKey = `${item.chapterTitle}__${item.subtopicName}`;
      progressMap[lessonKey] = item.isWatched || false;
    });

    return NextResponse.json({ progress: progressMap });
  } catch (error) {
    console.error("Error loading progress:", error);
    return NextResponse.json({ error: "Failed to load progress" }, { status: 500 });
  }
}

// POST: Save user progress
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, chapterTitle, subtopicName, isWatched } = body;

    if (!courseId || !chapterTitle || !subtopicName || typeof isWatched !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields: courseId, chapterTitle, subtopicName, isWatched" },
        { status: 400 }
      );
    }

    // Check if progress entry already exists
    const existing = await db
      .select()
      .from(UserProgress)
      .where(
        and(
          eq(UserProgress.userId, userId),
          eq(UserProgress.courseId, courseId),
          eq(UserProgress.chapterTitle, chapterTitle),
          eq(UserProgress.subtopicName, subtopicName)
        )
      );

    if (existing.length > 0) {
      // Update
      await db
        .update(UserProgress)
        .set({
          isWatched,
          watchedAt: isWatched ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(UserProgress.userId, userId),
            eq(UserProgress.courseId, courseId),
            eq(UserProgress.chapterTitle, chapterTitle),
            eq(UserProgress.subtopicName, subtopicName)
          )
        );
    } else {
      // Insert
      await db.insert(UserProgress).values({
        userId,
        courseId,
        chapterTitle,
        subtopicName,
        isWatched,
        watchedAt: isWatched ? new Date() : null,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}