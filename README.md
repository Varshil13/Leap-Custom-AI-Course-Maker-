# LEAP v1 - AI Course Maker

LEAP is an AI-powered learning platform that helps users generate custom courses, curate lesson videos, create lesson notes on demand, track progress, and receive completion certificates.

Live app: https://leap-v1.vercel.app

## What This Project Does

- Authenticates users with Clerk.
- Generates structured course roadmaps with AI.
- Lets users reorder and edit roadmap modules/subtopics with drag-and-drop.
- Helps users assign videos to each subtopic (YouTube search, custom URL, or skip).
- Generates lesson content on demand in LaTeX-style format and renders it in the learning view.
- Tracks per-lesson completion progress.
- Generates PDF certificates and sends them by email when a course is fully completed.

## Product Flow

1. User signs in.
2. User creates a course topic and level.
3. AI generates a roadmap.
4. User edits the roadmap.
5. User selects videos for each lesson.
6. User opens a lesson and generates lesson content when needed.
7. User marks lessons as watched.
8. After 100% completion, user requests a certificate by email.

## Tech Stack

- Framework: Next.js 15 (App Router), React 19
- Styling: Tailwind CSS v4, shadcn/ui, Radix UI
- Auth: Clerk
- Database: Neon Postgres + Drizzle ORM
- AI: Groq-compatible chat completion API (via `services/gemini.ts`)
- Video search: YouTube Data API v3
- Certificate generation: pdf-lib
- Email: Nodemailer (Gmail SMTP)

## Folder Overview

```text
app/
	(auth)/                 # Clerk sign-in/sign-up pages
	api/                    # Server routes for AI, progress, certificate, delete
	createCourse/           # Course creation wizard
	dashboard/              # User dashboard, completed courses, learning pages
	_components/            # Landing and shared app components
services/
	db.js                   # Drizzle + Neon database client
	schema.ts               # Database tables
	gemini.ts               # AI client wrapper
	youtube.ts              # YouTube search client
components/ui/            # UI primitives
```

## Routes

### Public routes

- `/`
- `/sign-in`
- `/sign-up`

### Protected routes (via Clerk middleware)

- `/dashboard`
- `/dashboard/completed`
- `/dashboard/learnCourse/[courseId]`
- `/dashboard/upgrade` (currently placeholder)
- `/createCourse`
- `/createCourse/[courseId]/chooseVideos`

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/genRoadmap` | Generates roadmap text using AI from a prompt |
| POST | `/api/genCourseDetails` | Generates course details with retry/backoff on overload |
| POST | `/api/genSubtopicContent` | Generates focused lesson content for one subtopic |
| GET | `/api/progress?courseId=...` | Returns watched status map for current user |
| POST | `/api/progress` | Saves or updates lesson watched status |
| POST | `/api/genCertificate` | Verifies 100% completion and generates certificate PDF (base64) |
| POST | `/api/sendCertificate` | Sends certificate PDF by email and updates status |
| DELETE | `/api/deleteCourse?courseId=...` | Deregisters user and deletes related course data |

## Database Schema (Drizzle)

Main tables in `services/schema.ts`:

- `CourseDetails`: course metadata and roadmap JSON
- `CourseVideos`: selected video per lesson
- `CourseContent`: generated lesson content per subtopic
- `UserProgress`: watched status per lesson per user
- `Certificates`: certificate request and send status

## Local Setup

### 1. Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- npm
- Clerk application
- Neon Postgres database
- Groq API key
- YouTube Data API key
- Gmail account with App Password enabled

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```bash
# Database
NEXT_PUBLIC_DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require

# AI provider
GROQ_API_KEY=<your_groq_api_key>
# Optional fallback name supported by code:
# GROK_API_KEY=<your_groq_api_key>

# YouTube
NEXT_PUBLIC_YOUTUBE_API_KEY=<your_youtube_data_api_key>

# Clerk
CLERK_SECRET_KEY=<your_clerk_secret_key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Email (certificate delivery)
GMAIL_USER=<your_gmail_address>
GMAIL_APP_PASSWORD=<your_gmail_app_password>
```

Important:

- Never commit real secrets to git.
- If keys were ever committed, rotate them immediately.

### 4. Push database schema

```bash
npm run db:push
```

### 5. Run development server

```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

- `npm run dev` - Start dev server with Turbopack
- `npm run build` - Production build with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Drizzle schema to DB
- `npm run db:studio` - Open Drizzle Studio

## Deployment (Vercel)

This project is already deployed at:

- https://leap-v1.vercel.app

To redeploy or set up another environment:

1. Import repository in Vercel.
2. Set all environment variables from the list above.
3. Trigger deploy.
4. Verify protected routes and API endpoints after deployment.

## Certificate Workflow

1. User reaches 100% lesson completion.
2. `POST /api/genCertificate` checks eligibility and generates PDF.
3. `POST /api/sendCertificate` emails the PDF attachment.
4. Certificate status is updated in DB (`pending` -> `sent` or `failed`).

## Troubleshooting

- AI returns overload/503:
	- Retry after a short delay; one endpoint already uses backoff.
	- Verify AI API key and provider quota.
- Progress not updating:
	- Confirm user is authenticated.
	- Ensure database and `user_progress` writes are working.
- Videos not loading:
	- Check YouTube API key and quota.
- Certificate email not sent:
	- Verify Gmail App Password and SMTP permission.
	- Check server logs for send errors.

## Current Status

- Core course creation, learning, progress, and certificate flow is implemented.
- Upgrade page is currently marked as under development.

## License

No license file is currently defined in this repository. Add a `LICENSE` file if you plan to open-source or distribute this project.
