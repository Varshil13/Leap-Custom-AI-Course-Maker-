import { json, pgTable, serial, varchar,boolean, timestamp } from "drizzle-orm/pg-core";

export const CourseDetails = pgTable("CourseDetails", {
    id:serial('id').primaryKey(),
    courseId:varchar('course_id'),
    name:varchar('name'),
    description:varchar('description'),
    duration:varchar('duration'),
    level:varchar('level'),
    userName:varchar('user_name'),
    userProfileImage:varchar('user_profile_image'),
    createdBy:varchar('created_by'),
    roadmap:json('roadmap'),
    includeVideos:boolean('include_videos')
})

export const CourseVideos = pgTable("course_videos", {
  id: serial("id").primaryKey(),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  chapterTitle: varchar("chapter_title", { length: 255 }).notNull(),
  subtopicName: varchar("subtopic_name", { length: 255 }).notNull(),
  videoData: json("video_data"), // Store the selected video object
  createdAt: timestamp("created_at").defaultNow(),
});

export const CourseContent = pgTable("course_content", {
  id: serial("id").primaryKey(),
  courseId: varchar("course_id", { length: 255 }).notNull(),
  chapterTitle: varchar("chapter_title", { length: 255 }).notNull(),
  subtopicName: varchar("subtopic_name", { length: 255 }).notNull(),
  contentData: json("content_data"), // Store the generated content object
  createdAt: timestamp("created_at").defaultNow(),
}); 



export const UserProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(), // Auth user ID (e.g., Clerk)
  courseId: varchar("course_id", { length: 255 }).notNull(),
  chapterTitle: varchar("chapter_title", { length: 255 }).notNull(),
  subtopicName: varchar("subtopic_name", { length: 255 }).notNull(),
  isWatched: boolean("is_watched").default(false),
  watchedAt: timestamp("watched_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});