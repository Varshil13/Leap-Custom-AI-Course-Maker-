'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/services/db";
import { CourseDetails, CourseVideos, CourseContent } from "@/services/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { extractJsonArray } from "@/app/_utils/extractJsonArray";
import { useUser } from "@clerk/nextjs";






function LearnCoursePage() {
  const { courseId } = useParams();
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [courseContent, setCourseContent] = useState([]);
  // Track watched state per lessonKey, now persisted
  const [watched, setWatched] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchCourse();
      fetchCourseContent();
      loadProgress();
    }
  }, [courseId, user]);
  // Load user progress from API
  const loadProgress = async () => {
    try {
      setLoadingProgress(true);
      const response = await fetch(`/api/progress?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setWatched(data.progress || {});
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoadingProgress(false);
    }
  };


  // Save progress to API
  const saveProgress = async (chapterTitle, subtopicName, isWatched) => {
    try {
      
      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          chapterTitle,
          subtopicName,
          isWatched,
        }),
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Toggle watched state and persist
  const toggleWatched = async (lessonKey) => {
    const [chapterTitle, subtopicName] = lessonKey.split("__");
    const newWatched = !watched[lessonKey];
    setWatched(prev => ({ ...prev, [lessonKey]: newWatched }));
    await saveProgress(chapterTitle, subtopicName, newWatched);
  };


  
  // Fetch course content from DB
  const fetchCourseContent = async () => {
    const rows = await db
      .select()
      .from(CourseContent)
      .where(eq(CourseContent.courseId, courseId));
    setCourseContent(Array.isArray(rows) ? rows : []);
  };

 

  const fetchCourse = async () => {
    // Fetch course details
    const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.courseId, courseId));
    const courseData = result[0];
    setCourse(courseData);
    // Parse roadmap
    let roadmapData = [];
    try {
      roadmapData = courseData?.roadmap
        ? (typeof courseData.roadmap === "string"
            ? JSON.parse(courseData.roadmap)
            : courseData.roadmap)
        : [];
    } catch {
      roadmapData = [];
    }
    setRoadmap(Array.isArray(roadmapData) ? roadmapData : []);
    // Fetch videos
    const videoRows = await db
      .select()
      .from(CourseVideos)
      .where(eq(CourseVideos.courseId, courseId));
    setVideos(Array.isArray(videoRows) ? videoRows : []);
  };

  // Helper to get video for selected chapter/subtopic
  const getVideoForKey = (chapterTitle, subtopicName) => {
    return videos.find(v => v.chapterTitle === chapterTitle && v.subtopicName === subtopicName)?.videoData;
  };

  // Sidebar: chapters/subtopics
  return (
  <div className="flex h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <div className="w-80 shadow-lg border-r" style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <h2 className="font-bold text-xl" style={{ color: 'var(--sidebar-foreground)' }}>Course Content</h2>
          {course && (
            <div className="mt-2">
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>{course.name}</p>
              <div className="flex items-center mt-1">
                <div className="w-full rounded-full h-2" style={{ background: 'var(--muted)' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      background: 'var(--primary)',
                      width: `${roadmap.length > 0 
                        ? (Object.keys(watched).filter(key => watched[key]).length / 
                           roadmap.reduce((total, chapter) => total + (chapter.subtopics?.length || 0), 0)) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="ml-3 text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                  {Object.keys(watched).filter(key => watched[key]).length} / {roadmap.reduce((total, chapter) => total + (chapter.subtopics?.length || 0), 0)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-140px)] p-4">
          {roadmap.map((chapter, idx) => (
            <div key={idx} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--sidebar-foreground)' }}>{chapter.title}</div>
                </div>
              <ul className="ml-10 space-y-1">
                {(chapter.subtopics || []).map((subtopic, sidx) => {
                  const lessonKey = `${chapter.title}__${subtopic}`;
                  const isWatched = watched[lessonKey];
                  const isActive = selectedKey === lessonKey;
                  return (
                    <li
                      key={sidx}
                      className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${
                        isActive 
                          ? "shadow-md"
                          : ""
                      }`}
                      style={{
                        background: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? 'var(--primary-foreground)' : 'var(--sidebar-foreground)',
                      }}
                      onClick={() => setSelectedKey(lessonKey)}
                    >
                      <span className="flex-1">{subtopic}</span>
                      {isWatched && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center`}
                          style={{
                            background: isActive ? 'var(--primary-foreground)' : '#22d3ee',
                            color: isActive ? 'var(--primary)' : 'white',
                          }}>
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
               
      {/* Main section: show video */}
  <div className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto p-8">
          {!selectedKey && (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Welcome to Your Course</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Select a lesson from the sidebar to start learning</p>
            </div>
          )}
            {selectedKey && (() => {
              // Find chapter/subtopic
              const [chapterTitle, subtopicName] = selectedKey.split("__");
              const videoData = getVideoForKey(chapterTitle, subtopicName);
              // Find course content for this subtopic
              const contentRow = courseContent.find(
                (row) => row.chapterTitle === chapterTitle && row.subtopicName === subtopicName
              );
              // Find chapter explanation (where subtopicName === chapterTitle)
              const chapterExplanation = courseContent.find(
                (row) => row.chapterTitle === chapterTitle && row.subtopicName === chapterTitle
              );
              if (!videoData) return <div className="text-gray-400">No video found for this subtopic.</div>;
              if (videoData.skipped) return <div className="text-gray-400">This subtopic was skipped.</div>;
              let videoSection = null;
              if (videoData.customUrl) {
                // Extract YouTube video ID from URL
                const url = videoData.customUrl;
                let vidId = "";
                try {
                  const urlObj = new URL(url);
                  if (urlObj.searchParams.get("v")) {
                    vidId = urlObj.searchParams.get("v");
                  } else if (urlObj.pathname.startsWith("/embed/")) {
                    vidId = urlObj.pathname.split("/embed/")[1];
                  } else if (urlObj.pathname.startsWith("/watch/")) {
                    vidId = urlObj.pathname.split("/watch/")[1];
                  } else {
                    vidId = url.split("v=")[1] || url;
                  }
                } catch {
                  vidId = url.split("v=")[1] || url;
                }
                videoSection = (
                  <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${vidId}`}
                    title="Custom Video"
                    frameBorder="0"
                    allowFullScreen
                    className="rounded"
                  />
                );
              } else {
                // Standard YouTube video
                const vidId = videoData.id?.videoId || videoData.id;
                videoSection = (
                  <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${vidId}`}
                    title={videoData.snippet?.title || subtopicName}
                    frameBorder="0"
                    allowFullScreen
                    className="rounded"
                  />
                );
              }
              return (
                <div className="w-full">
                  {/* Video Header with Title and Watched Checkbox */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{subtopicName}</h1>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{chapterTitle}</p>
                    </div>
                    <label
                      className="flex items-center gap-2 cursor-pointer select-none px-4 py-2 rounded-lg border transition-colors"
                      style={{
                        background: 'var(--muted)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!watched[selectedKey]}
                        onChange={() => toggleWatched(selectedKey)}
                        className="accent-cyan-400 w-5 h-5"
                        disabled={loadingProgress}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {loadingProgress ? "Saving..." : "Mark as Watched"}
                      </span>
                    </label>
                  </div>

                  {/* Video Player */}
                  <div className="rounded-xl overflow-hidden shadow-lg mb-6" style={{ background: 'black' }}>
                    {videoSection}
                  </div>

                  {/* Video Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {videoData.snippet?.title || subtopicName}
                    </h3>
                    {videoData.snippet?.channelTitle && (
                      <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>By {videoData.snippet.channelTitle}</p>
                    )}
                  </div>

                  {/* Chapter Introduction */}
                  {subtopicName === chapterTitle && chapterExplanation && chapterExplanation.contentData?.content && (
                    <div className="mb-6 p-6 rounded-r-lg" style={{ background: 'var(--muted)', borderLeft: '4px solid var(--primary)' }}>
                      <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--primary)' }}>Chapter Overview</h4>
                      <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>{chapterExplanation.contentData.content}</p>
                    </div>
                  )}

                  {/* Lesson Content */}
                  {contentRow && contentRow.contentData?.content && (
                    <div className="p-6 rounded-lg border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                      <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Lesson Content</h4>
                      <div className="prose prose-gray max-w-none">
                        <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--foreground)' }}>
                          {contentRow.contentData.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

export default LearnCoursePage;