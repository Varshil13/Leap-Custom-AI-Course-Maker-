"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/services/db";
import { CourseDetails,CourseContent } from "@/services/schema";
import getVideos from "@/services/youtube";
import LoadingDialouge from "@/app/createCourse/_components/LoadingDialouge";
import { eq } from "drizzle-orm";
import { CourseVideos } from "@/services/schema";
import { extractJsonArray } from "@/app/_utils/extractJsonArray";


function ChooseVideosPage() {
  const params = useParams();
  const courseId = params.courseId;
  const [course, setCourse] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [lessonVideos, setLessonVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState({});
  const [showCustomInput, setShowCustomInput] = useState({});
  const [customUrls, setCustomUrls] = useState({});
  const [courseContent, setCourseContent] = useState([]);
  


  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // useEffect(()=>{
  //   console.log("help",courseContent)

  // },[])

  const fetchCourse = async () => {
    setLoading(true);
    // Fetch course details from DB
    
    
    const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.courseId, courseId));
    const courseData = result[0];
  
    
    setCourse(courseData);
    // Parse roadmap and set
    try {
      const roadmapData =
        typeof courseData.roadmap === "string"
          ? JSON.parse(courseData.roadmap)
          : courseData.roadmap ?? [];
      setRoadmap(roadmapData);
      const existingSelections = await loadExistingVideos(); // Load existing first
      await fetchAllLessonVideos(roadmapData, existingSelections); // Pass existing to skip API calls
    } catch {
      setRoadmap([]);
    }
    setLoading(false);
  };

  const fetchAllLessonVideos = async (roadmapData, existingSelections = {}) => {
    const videosMap = {};
    for (const chapter of roadmapData) {
      for (const lesson of chapter.subtopics) {
        const lessonKey = `${chapter.title}__${lesson}`;
        
        // Skip YouTube API call if this lesson already has a selected video
        if (existingSelections[lessonKey]) {
          console.log(`Skipping YouTube API for ${lessonKey} - already has selection`);
          videosMap[lessonKey] = []; // Set empty array since we don't need to show other options
          continue;
        }
        
        try {
          console.log(`Fetching YouTube videos for ${lessonKey}`);
          const videos = await getVideos(lesson);
          videosMap[lessonKey] = videos;
        } catch {
          videosMap[lessonKey] = [];
        }
      }
    }
    setLessonVideos(videosMap);
  };


   const  generateCourseContent = async () => {

      const result = await db
      .select()
      .from(CourseDetails)
      .where(eq(CourseDetails.courseId, courseId));
      console.log("Fetched Course for Content Generation:", result);
      const courseData = result[0];
      console.log("Course Data for Content Generation:", courseData);

      const roadmap = courseData?.roadmap
      const level = courseData?.level ;

      console.log("Generating content for roadmap:", roadmap);
      console.log("Course Topic:", level);
     

  const prompt = `You are an expert educator and curriculum designer. For the following course roadmap, generate comprehensive, in-depth course content for each chapter and its subtopics.

Instructions:
- For each chapter, write a detailed introduction explaining the chapter purpose and importance.
- For each subtopic, write a thorough, self-contained explanation that covers all essential concepts, practical details, and advanced insights as needed for the specified course level.
- The content should be complete enough that a learner can read it and fully understand the topic without needing other resources.
- If the course level is "advanced", provide deeper technical details, examples, and expert tips.
- Do NOT use markdown, bullet points, or formatting—just plain text.
- Output should be a valid JSON array as shown below.


Course Level: ${level}
Course Roadmap: ${JSON.stringify(roadmap)}

Roadmap Example:
[
  { "id": "1", "title": "Chapter Title One", "subtopics": ["Subtopic A", "Subtopic B"] },
  { "id": "2", "title": "Chapter Title Two", "subtopics": ["Subtopic C", "Subtopic D"] }
]

Output Format Example:
[
  {
    "chapter": "Chapter Title One",
    "introduction": "In-depth introduction text...",
    "subtopics": [
      { "name": "Subtopic A", "content": "Comprehensive explanation for Subtopic A." },
      { "name": "Subtopic B", "content": "Comprehensive explanation for Subtopic B." }
    ]
  },
  ...
]
`

try {
      // 1. Send the request to your Next.js API Route
      const response = await fetch("/api/genCourseDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      // 2. Get the structured result from the API
      const data = await response.json();

      // Parse the roadmap from the AI response text
      console.log(data,data.text);
      
      let courseContent = [];
      try {
        // Try to extract JSON array first
        courseContent = extractJsonArray(data.text);
        console.log("Extracted course content:", courseContent);
      } catch (extractError) {
        console.error("Failed to extract JSON array:", extractError);
        
        // Fallback: Try to find and parse JSON manually
        try {
          const jsonMatch = data.text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            courseContent = JSON.parse(jsonMatch[0]);
            console.log("Manually parsed course content:", courseContent);
          } else {
            console.error("No JSON array found in response");
            alert("The AI response format is invalid. Please try again.");
            return;
          }
        } catch (manualError) {
          console.error("Manual JSON parsing also failed:", manualError);
          alert("Failed to parse AI response. Please try again.");
          return;
        }
      }
      
      // Validate the structure before setting state
      if (!Array.isArray(courseContent)) {
        console.error("Course content is not an array:", courseContent);
        alert("Invalid course content format. Please try again.");
        return;
      }
      
      // Validate each chapter has required structure
      const isValidStructure = courseContent.every(chapter => 
        chapter && 
        typeof chapter.chapter === 'string' && 
        Array.isArray(chapter.subtopics) &&
        chapter.subtopics.every(subtopic => 
          subtopic && 
          typeof subtopic.name === 'string' && 
          typeof subtopic.content === 'string'
        )
      );
      
      if (!isValidStructure) {
        console.error("Course content has invalid structure:", courseContent);
        alert("Course content structure is invalid. Please try again.");
        return;
      }

      setCourseContent(courseContent);
      console.log("Course Content Generated successfully:", courseContent);
      return courseContent; // Return for use in finish button

    } catch (error) {
      console.error("Fetch failed:", error);
      alert("Failed to generate course content. Please try again.");
      return null;
    }
  
  }


  const saveSelectedVideos = async () => {
    // Delete existing videos for this course
    await db.delete(CourseVideos).where(eq(CourseVideos.courseId, courseId));
    // Insert new video selections
    const videoInserts = [];
    for (const [lessonKey, video] of Object.entries(selectedVideos)) {
      if (video) {
        const [chapterTitle, subtopicName] = lessonKey.split("__");
        videoInserts.push({
          courseId,
          chapterTitle,
          subtopicName,
          videoData: video,
        });
      }
    }
    if (videoInserts.length > 0) {
      await db.insert(CourseVideos).values(videoInserts);
    }
    alert("Videos saved successfully!");
  };

  // Save generated course content to course_content table
  const saveCourseContent = async (courseContent) => {
    try {
      console.log("Starting to save course content:", courseContent);
      
      if (!Array.isArray(courseContent) || courseContent.length === 0) {
        console.error("Invalid course content format:", courseContent);
        throw new Error("Course content is not a valid array");
      }
      
      // Remove existing content for this course
      await db.delete(CourseContent).where(eq(CourseContent.courseId, courseId));
      
      const contentInserts = [];
      
      for (const chapter of courseContent) {
        if (!chapter || !chapter.chapter || !Array.isArray(chapter.subtopics)) {
          console.warn("Skipping invalid chapter:", chapter);
          continue;
        }
        
        const chapterTitle = chapter.chapter;
        
        for (const sub of chapter.subtopics) {
          if (!sub || !sub.name || !sub.content) {
            console.warn("Skipping invalid subtopic:", sub);
            continue;
          }
          
          contentInserts.push({
            courseId,
            chapterTitle,
            subtopicName: sub.name,
            contentData: { content: sub.content },
          });
        }
      }
      
      console.log("Prepared Course Content for Insertion:", contentInserts);
      
      if (contentInserts.length === 0) {
        throw new Error("No valid content to insert");
      }
      
      await db.insert(CourseContent).values(contentInserts);
      console.log("Successfully inserted course content");
      
    } catch (error) {
      console.error("Error saving course content:", error);
      throw error;
    }
  };

const loadExistingVideos = async () => {
  const existingVideos = await db
    .select()
    .from(CourseVideos)
    .where(eq(CourseVideos.courseId, courseId));
  
  const videoMap = {};
  existingVideos.forEach(row => {
    const lessonKey = `${row.chapterTitle}__${row.subtopicName}`;
    videoMap[lessonKey] = row.videoData;
  });
  
  setSelectedVideos(videoMap);
  return videoMap; // Return the map so other functions can use it
};



  return (
  <div className="max-w-3xl mx-auto mt-10 p-6" style={{ background: 'var(--background)' }}>
      <LoadingDialouge loading={loading} activeStep={'Fetching Videos'} />
  <h2 className="font-bold text-2xl mb-6 text-center text-foreground">Choose Videos</h2>
      {!course && <div>Loading course...</div>}
      {course && (
        <>
          <div className="mb-8">
            <h3 className="font-semibold text-lg text-foreground">Course: {course.name}</h3>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{course.description}</p>
          </div>
          <div>
            {roadmap.map((chapter, index) => (
              <div key={index} className="border p-4 rounded-lg mb-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <h3 className="bg-primary h-10 w-10 rounded-full text-white text-center flex items-center justify-center">
                    {index + 1}
                  </h3>
                  <h3 className="font-medium text-lg text-foreground">{chapter.title}</h3>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>DESCRIPTION</p>
                <div className="mt-2">
                  <h4 className="font-semibold text-foreground">Lessons:</h4>
                  <ul className="list-inside mt-1">
                    {chapter.subtopics.map((lesson, lessonIndex) => {
                      const lessonKey = `${chapter.title}__${lesson}`;
                      const videos = lessonVideos[lessonKey] || [];
                      return (
                        <li
                          key={lessonIndex}
                          className="text-sm mb-4"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary h-7 w-7 rounded-full text-white text-center flex items-center justify-center font-semibold">
                              {lessonIndex + 1}
                            </span>
                            <span className="font-semibold text-foreground">{lesson}</span>
                          </div>
                          <div className="flex gap-4 flex-wrap">
                            {/* Show existing selected video if any */}
                            {selectedVideos[lessonKey] && (
                              <div className="border-2 rounded-lg p-2 w-48 flex flex-col items-center"
                                style={{ borderColor: '#22d3ee' }}>
                                <img
                                  src={selectedVideos[lessonKey].snippet?.thumbnails?.medium?.url || "/placeholder.png"}
                                  alt="Selected Video"
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <div className="text-xs mb-1 font-semibold" style={{ color: '#22d3ee' }}>
                                  {selectedVideos[lessonKey].snippet?.channelTitle || "Custom Video"}
                                </div>
                                <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                  {selectedVideos[lessonKey].snippet?.title || selectedVideos[lessonKey].customUrl || "Selected"}
                                </div>
                                <button 
                                  className="px-3 py-1 rounded text-xs"
                                  style={{ background: '#22d3ee', color: 'white' }}
                                  onClick={async () => {
                                    // Deselect the video
                                    setSelectedVideos(prev => ({ ...prev, [lessonKey]: null }));
                                    
                                    // Re-fetch videos for this lesson if not already available
                                    if (!lessonVideos[lessonKey] || lessonVideos[lessonKey].length === 0) {
                                      try {
                                        const lessonName = lessonKey.split('__')[1];
                                        const videos = await getVideos(lessonName);
                                        setLessonVideos(prev => ({ ...prev, [lessonKey]: videos }));
                                      } catch (error) {
                                        console.error("Error fetching videos:", error);
                                      }
                                    }
                                  }}
                                >
                                  ✓ Selected
                                </button>
                              </div>
                            )}
                            
                            {/* Show YouTube videos if no selection made */}
                            {!selectedVideos[lessonKey] && videos.length === 0 && (
                              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                No videos found.
                              </div>
                            )}
                            {!selectedVideos[lessonKey] && videos.map((video, vidIdx) => (
                              <div
                                key={vidIdx}
                                className="border rounded-lg p-2 w-48 flex flex-col items-center hover:border-primary cursor-pointer"
                                style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
                              >
                                <img
                                  src={video.snippet?.thumbnails?.medium?.url}
                                  alt="Thumbnail"
                                  className="w-full h-24 object-cover rounded mb-2"
                                />
                                <div className="text-xs mb-1" style={{ color: 'var(--foreground)' }}>
                                  {video.snippet?.channelTitle}
                                </div>
                                <div className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                  {video.snippet?.title}
                                </div>
                                <button 
                                  className="px-3 py-1 rounded text-xs"
                                  style={{ background: 'var(--primary)', color: 'white' }}
                                  onClick={() => setSelectedVideos(prev => ({ ...prev, [lessonKey]: video }))}
                                >
                                  Select
                                </button>
                              </div>
                            ))}
                            
                            {/* Skip and Custom URL buttons */}
                            {!selectedVideos[lessonKey] && (
                              <>
                                <button
                                  className="px-3 py-1 rounded text-xs h-fit"
                                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                                  onClick={() => setSelectedVideos(prev => ({ ...prev, [lessonKey]: { skipped: true } }))}
                                >
                                  Skip
                                </button>
                                <button
                                  className="px-3 py-1 rounded text-xs h-fit"
                                  style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                                  onClick={() => setShowCustomInput(prev => ({ ...prev, [lessonKey]: true }))}
                                >
                                  Add Custom URL
                                </button>
                              </>
                            )}
                            
                            {/* Custom URL input */}
                            {showCustomInput[lessonKey] && (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  placeholder="Paste YouTube URL"
                                  value={customUrls[lessonKey] || ""}
                                  onChange={(e) => setCustomUrls(prev => ({ ...prev, [lessonKey]: e.target.value }))}
                                  className="border rounded px-2 py-1 text-xs"
                                  style={{ borderColor: 'var(--input)', background: 'var(--background)', color: 'var(--foreground)' }}
                                />
                                <button
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ background: '#22d3ee', color: 'white' }}
                                  onClick={() => {
                                    setSelectedVideos(prev => ({ ...prev, [lessonKey]: { customUrl: customUrls[lessonKey] } }));
                                    setShowCustomInput(prev => ({ ...prev, [lessonKey]: false }));
                                    setCustomUrls(prev => ({ ...prev, [lessonKey]: "" }));
                                  }}
                                >
                                  Save URL
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          {/* Save and Finish Buttons */}
          <div className="mt-8 text-center flex gap-4 justify-center">
            <button
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ background: 'var(--primary)', color: 'white' }}
              onClick={saveSelectedVideos}
              disabled={Object.keys(selectedVideos).length === 0}
            >
              Save Selected Videos ({Object.keys(selectedVideos).length} selected)
            </button>
            <button
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ background: '#22d3ee', color: 'white' }}
              onClick={async () => {
                try {
                  setLoading(true);
                  // Generate course content first and get the result
                  const generatedContent = await generateCourseContent();
                  if (!generatedContent) {
                    alert("Failed to generate course content. Please try again.");
                    setLoading(false);
                    return;
                  }
                  // Save videos
                  await saveSelectedVideos();
                  // Save course content using the generated content
                  await saveCourseContent(generatedContent);
                  alert("Course completed successfully!");
                  window.location.href = `/dashboard`;
                } catch (error) {
                  console.error("Error finishing course:", error);
                  alert("An error occurred while finishing the course. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={Object.keys(selectedVideos).length === 0 || loading}
            >
              {loading ? "Processing..." : "Finish Course"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChooseVideosPage;
