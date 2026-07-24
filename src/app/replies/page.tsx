"use client";

import { useDemo } from "@/lib/store";
import { RepliesView } from "@/components/replies-view";

export default function RepliesPage() {
  const { jobs } = useDemo();
  const replies = jobs
    .filter((j) => j.lastReply || j.replyClass)
    .sort((a, b) => b.lastReply.localeCompare(a.lastReply));

  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">comms</div>
        <h1 className="font-display mt-1 text-2xl font-extrabold tracking-tight">Replies</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--ink-55)" }}>
          The scanner reads the watched inboxes each run, matches recruiter emails to
          tracked applications, and moves status forward. A genuine next step sends an
          instant alert email; rejections quietly close their rows. Your manual edits
          always win: use the Class dropdown to correct a misread, or remove a
          non-reply entirely.
        </p>
      </div>

      <RepliesView jobs={replies} />
    </div>
  );
}
