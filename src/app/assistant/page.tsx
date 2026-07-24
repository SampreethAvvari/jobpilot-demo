"use client";

import { DemoChat } from "@/components/demo-chat";

export default function AssistantPage() {
  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">copilot</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">Assistant</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--ink-55)" }}>
          Grounded in the pilot&apos;s resumes, GitHub, portfolio, and knowledge pack,
          and nothing else. Resume rewrites, cover letters, and application answers
          only; finished PDFs run through the same ATS-checked pipeline as
          auto-tailoring. The demo replays recorded answers; the real console is
          live Gemini with image and PDF attachments.
        </p>
      </div>

      <DemoChat />
    </div>
  );
}
