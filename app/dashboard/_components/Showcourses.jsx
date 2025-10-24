"use client"   
import { use, useEffect, useState } from "react";
import LoadingDialouge from "../../createCourse/_components/LoadingDialouge";
import { db } from "@/services/db";
import { CourseDetails, CourseVideos } from "@/services/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Exportable cache invalidation function
export const invalidateProgressCache = (courseId) => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('progressCache');
      if (cached) {
        const obj = JSON.parse(cached);
        delete obj[courseId];
        localStorage.setItem('progressCache', JSON.stringify(obj));
      }
    } catch {}
  }
};

function Showcourses() {
  // Delete (deregister) course handler
  const [deregisterLoading, setDeregisterLoading] = useState({});
  const handleDeregister = async (courseId) => {
    if (!window.confirm('Are you sure you want to deregister from this course? This action cannot be undone.')) return;
    try {
      setDeregisterLoading(prev => ({ ...prev, [courseId]: true }));
      // Call API to delete course (implement this API if not present)
      const res = await fetch(`/api/deleteCourse?courseId=${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to deregister');
      setCourses(prev => prev.filter(c => c.courseId !== courseId));
      // Remove progress from cache
      invalidateProgressCache(courseId);
      setProgress(prev => {
        const newP = { ...prev };
        delete newP[courseId];
        return newP;
      });
      toast.success('Successfully deregistered from course.');
    } catch (e) {
      toast.error('Failed to deregister.');
    } finally {
      setDeregisterLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  // Persistent cache: load from localStorage if available
  const [progressCache, setProgressCache] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('progressCache');
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  // Removed certificateLoading state
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(2);
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      if (user?.id) {
        setActiveStep(2); // 2 = Fetching your courses...
        setLoading(true);
        
        const fetchedCourses = await fetchCourses();
        setLoading(false);
      
        setActiveStep(3); // 3 = Fetching your progress...
        setLoading(true);
        await fetchAllProgress(fetchedCourses);
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, [user]);

   
  const handleCourseClick = (courseId) => {
    // Handle course click, e.g., navigate to course details page
    console.log("Course clicked:", courseId);
    router.push(`/dashboard/learnCourse/${courseId }`);
  }

  // Removed handleCertificateRequest logic

  const fetchCourses = async () => {
    // Fetch all courses created by the user
    const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.createdBy, user.emailAddresses[0].emailAddress));
    setCourses(result);
    return result;
  };

  // Fetch progress for all courses for this user
  const fetchAllProgress = async (fetchedCourses) => {
    console.log("fetchedCourses in fetchAllProgress:", fetchedCourses);

    const progressObj = { ...progressCache };
    console.log("Courses to fetch progress for:", fetchedCourses);
    for (const course of fetchedCourses) {
      if (progressObj[course.courseId] !== undefined) {
        // Already cached, skip API call
        continue;
      }
      console.log("Fetching progress for course:", course.courseId);
      // Fetch progress from API
      const res = await fetch(`/api/progress?courseId=${course.courseId}`);
      if (!res.ok) continue;
      const data = await res.json();
      console.log("Progress data for course", course.courseId, ":", data);
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
    }
    console.log("progress obj pre-set:", progressObj);
    setProgress(progressObj);
    setProgressCache(progressObj); // update cache
    // Save to localStorage for persistence

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('progressCache', JSON.stringify(progressObj));
      } catch {}
    }
    console.log("fetched progress");
  };


  // Only show non-completed courses
  const sortedCourses = [...courses]
    .filter(course => progress[course.courseId] !== 100)
    .sort((a, b) => {
      // Sort by createdAt (descending, newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

  return (
    <>
      <LoadingDialouge loading={loading} activeStep={activeStep} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 && !loading && <div>No courses found.</div>}
        {sortedCourses.map((course) => (
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
            <div
              className="w-full flex flex-col md:flex-row gap-2 mt-2 md:justify-center"
            >
              <Button
                className="w-full md:w-auto"
                onClick={() => handleCourseClick(course.courseId)}
              >
                View Course
              </Button>
              <Button
                className="w-full md:w-auto"
                variant="destructive"
                onClick={() => handleDeregister(course.courseId)}
                disabled={deregisterLoading[course.courseId]}
              >
                {deregisterLoading[course.courseId] ? 'Please wait...' : 'Deregister'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Showcourses;
