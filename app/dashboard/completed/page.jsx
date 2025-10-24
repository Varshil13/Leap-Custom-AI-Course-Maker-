
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/services/db";
import { CourseDetails } from "@/services/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LoadingDialouge from "../../createCourse/_components/LoadingDialouge";
import toast from "react-hot-toast";



function CompletedCourses() {
  const [certificateLoading, setCertificateLoading] = useState({});
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
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
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      if (user?.id) {
        setLoading(true);
        const fetchedCourses = await fetchCourses();
        await fetchAllProgress(fetchedCourses);
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, [user]);

  const fetchCourses = async () => {
    const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.createdBy, user.emailAddresses[0].emailAddress));
    setCourses(result);
    return result;
  };

  const fetchAllProgress = async (fetchedCourses) => {
    const progressObj = { ...progressCache };
    for (const course of fetchedCourses) {
      if (progressObj[course.courseId] !== undefined) {
        // Already cached, skip API call
        continue;
      }
      const res = await fetch(`/api/progress?courseId=${course.courseId}`);
      if (!res.ok) continue;
      const data = await res.json();
      const watchedCount = Object.values(data.progress || {}).filter(Boolean).length;
      let totalLessons = 0;
      try {
        const roadmap = typeof course.roadmap === "string" ? JSON.parse(course.roadmap) : course.roadmap;
        totalLessons = roadmap?.reduce((sum, ch) => sum + (ch.subtopics?.length || 0), 0) || 0;
      } catch {
        totalLessons = 0;
      }
      const percent = totalLessons > 0 ? Math.round((watchedCount / totalLessons) * 100) : 0;
      progressObj[course.courseId] = percent;
    }
    setProgress(progressObj);
    setProgressCache(progressObj); // update cache
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('progressCache', JSON.stringify(progressObj));
      } catch {}
    }
  };

  const completedCourses = courses.filter((course) => progress[course.courseId] === 100);

  // Certificate request logic (should be inside the component)
  const handleCertificateRequest = async (course) => {
    setCertificateLoading((prev) => ({ ...prev, [course.courseId]: true }));
    try {
      // Generate certificate
      const genResponse = await fetch("/api/genCertificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.courseId,
          courseName: course.name,
          userName: user?.fullName || user?.firstName || "Student",
          userEmail: user?.emailAddresses[0]?.emailAddress,
        }),
      });
      const genData = await genResponse.json();
      if (!genResponse.ok) {
        toast.error(genData.error || "Failed to generate certificate");
        return;
      }
      // Send certificate via email
      const sendResponse = await fetch("/api/sendCertificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: genData.certificateId,
          pdfBase64: genData.pdfBase64,
          userEmail: user?.emailAddresses[0]?.emailAddress,
          userName: user?.fullName || user?.firstName || "Student",
          courseName: course.name,
        }),
      });
      const sendData = await sendResponse.json();
      if (sendResponse.ok) {
        toast.success(
          `🎉 Certificate sent successfully! Check your email: ${user?.emailAddresses[0]?.emailAddress}`
        );
      } else {
        toast.error(sendData.error || "Failed to send certificate");
      }
    } catch (error) {
      console.error("Certificate error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setCertificateLoading((prev) => ({ ...prev, [course.courseId]: false }));
    }
  };

  return (
    <>
      <LoadingDialouge loading={loading} activeStep={2} />
      <div>
        <h2 className="text-2xl font-bold mb-4">Completed Courses</h2>
        {!loading &&
          (completedCourses.length === 0 ? (
            <div>No completed courses found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <div
                  key={course.courseId}
                  className="border rounded-lg p-4 flex flex-col items-center shadow-md"
                  style={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <img
                    src={course.coverPhoto || "/placeholder.png"}
                    alt={course.name}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h3 className="font-bold text-lg mb-1 text-foreground">
                    {course.name}
                  </h3>
                  <p
                    className="text-sm mb-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {course.description}
                  </p>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    100% completed
                  </span>
                  <div className="w-full flex flex-col md:flex-row gap-2 mt-2 md:justify-center">
                    <Button
                      className="w-full md:w-auto"
                      onClick={() =>
                        router.push(`/dashboard/learnCourse/${course.courseId}`)
                      }
                    >
                      View Course
                    </Button>
                    <Button
                      className="w-full md:w-auto"
                      variant="outline"
                      onClick={() => handleCertificateRequest(course)}
                      disabled={certificateLoading[course.courseId]}
                    >
                      {certificateLoading[course.courseId]
                        ? "Sending Certificate..."
                        : "🏆 Get Certificate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </>
  );
}

export default CompletedCourses;
