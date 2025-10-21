"use client";

import { UserInputContext } from "@/app/_context/UserInputContext";
import { Button } from "@/components/ui/button";

import React, { useContext, useState } from "react";

function TopicForm() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const [topic, setTopic] = useState(userCourseInput?.topic ?? "");
  const [level, setLevel] = useState(userCourseInput?.level);
  const levels = [
    { label: "Introductory" },
    { label: "Beginner" },
    { label: "Intermediate" },
    { label: "Advanced" },
  ];
  function handleTopic(value){
    setTopic(value);
    setUserCourseInput(prev => ({ ...(prev ?? {}), topic: value }));
  } 

  function handleLevel(value){
    setLevel(value);
    setUserCourseInput(prev => ({ ...(prev ?? {}), level: value }));
  }

  // New: Include Videos option
  const [includeVideos, setIncludeVideos] = useState(userCourseInput?.includeVideos ?? false);
  function handleIncludeVideos(value) {
    setIncludeVideos(value);
    setUserCourseInput(prev => ({ ...(prev ?? {}), includeVideos: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div>
      <div className="mx-auto mt-10 max-w-3xl ">
  <div className="rounded-xl border p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60 sm:p-6"
    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Topic */}
            <div className="space-y-2">
              <label
                htmlFor="topic"
                className="text-base font-medium sm:text-lg text-foreground"
              >
                Topic
              </label>
              <input
                id="topic"
                type="text"
                placeholder="e.g. React for Beginners"
                value={topic}
                onChange={(e) => handleTopic(e.target.value)}
                name="topic"
                autoComplete="off"
                required
                maxLength={120}
                aria-describedby="topic-help"
                className="w-full rounded-xl border px-3 py-2 text-base shadow-xs outline-none ring-0 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                style={{ borderColor: 'var(--input)', background: 'var(--background)', color: 'var(--foreground)' }}
              />
              <p id="topic-help" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                What should the course be about?
              </p>
            </div>

            {/* Level / Duration */}
            <div className="space-y-2">
              <label className="text-base font-medium sm:text-lg text-foreground">
                Level / Duration
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {levels.map((l) => (
                  <Button
                    key={l.label}
                    type="button"
                    variant={level === l.label ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleLevel(l.label)}
                    aria-pressed={level === l.label}
                    className="capitalize text-base sm:text-lg"
                  >
                    {l.label}
                  </Button>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Choose the difficulty or pacing that best fits your audience.
              </p>
            </div>

            {/* Include Videos Option */}
            <div className="space-y-2">
              <label className="text-base font-medium sm:text-lg text-foreground">
                Include Videos
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={includeVideos ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleIncludeVideos(true)}
                  aria-pressed={includeVideos}
                  className="text-base sm:text-lg"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!includeVideos ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleIncludeVideos(false)}
                  aria-pressed={!includeVideos}
                  className="text-base sm:text-lg"
                >
                  No
                </Button>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Would you like to include videos in your course?
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TopicForm;
