"use client"   
import { use, useEffect, useState } from "react";
import { db } from "@/services/db";
import { CourseDetails, CourseVideos } from "@/services/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Showcourses() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchCourses();
    }
  }, [user]);
  useEffect(() => {
    if (courses.length > 0 && user?.id) {
      fetchAllProgress();
    }
    // eslint-disable-next-line
  }, [courses, user]);
  console.log("User ID:", user?.id);    

   
  const handleCourseClick = (courseId) => {
    // Handle course click, e.g., navigate to course details page
    console.log("Course clicked:", courseId);
    router.push(`/dashboard/learnCourse/${courseId }`);
    
    
  }

  const fetchCourses = async () => {
    // Fetch all courses created by the user
    const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.createdBy, user.emailAddresses[0].emailAddress));
    setCourses(result);
  };

  // Fetch progress for all courses for this user
  const fetchAllProgress = async () => {
    const progressObj = {};
    for (const course of courses) {
      try {
        // Fetch progress from API
        const res = await fetch(`/api/progress?courseId=${course.courseId}`);
        if (!res.ok) continue;
        const data = await res.json();
        const watchedCount = Object.values(data.progress || {}).filter(Boolean).length;
        // Calculate total lessons (subtopics)
        let totalLessons = 0;
        try {
          const roadmap = typeof course.roadmap === 'string' ? JSON.parse(course.roadmap) : course.roadmap;
          totalLessons = roadmap?.reduce((sum, ch) => sum + (ch.subtopics?.length || 0), 0) || 0;
        } catch {
          totalLessons = 0;
        }
        const percent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;
        progressObj[course.courseId] = percent;
      } catch (err) {
        progressObj[course.courseId] = 0;
      }
    }
    setProgress(progressObj);
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.length === 0 && <div>No courses found.</div>}
      {courses.map((course) => (
        <div
          key={course.courseId}
          className="border rounded-lg p-4 flex flex-col items-center shadow-md"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <img
            src={course.coverPhoto || "/placeholder.png"}
            alt={course.name}
            className="w-full h-32 object-cover rounded mb-3"
          />
          <h3 className="font-bold text-lg mb-1 text-foreground">{course.name}</h3>
          <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{course.description}</p>
          <div className="w-full rounded-full h-4 mb-2" style={{ background: 'var(--muted)' }}>
            <div
              className="h-4 rounded-full"
              style={{
                width: `${progress[course.courseId] || 0}%`,
                background: 'var(--primary)'
              }}
            ></div>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
            {progress[course.courseId] || 0}% completed
          </span>
          <Button onClick={() => handleCourseClick(course.courseId)}>View Course</Button>
        </div>
      ))}
    </div>
  );
}

export default Showcourses;
