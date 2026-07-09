"use client";

import { useDemo } from "@/lib/store";
import { OutreachConsole } from "@/components/outreach-console";

export default function OutreachPage() {
  const { outreach } = useDemo();

  return (
    <div className="rise">
      <div className="mb-5">
        <div className="eyebrow">cold outreach</div>
        <h1 className="display mt-1 text-2xl font-extrabold tracking-tight">Outreach</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--text-dim)" }}>
          Search a company. JobPilot picks the best-fit resume, writes a short,
          plain-English cold email, builds a tailored cover letter, and finds a
          <b> published</b> careers email, scraped from the company&apos;s own site,
          never guessed. Everything lands as a Gmail draft the pilot reviews and
          sends. High-confidence emails are pre-addressed; missing ones stay blank
          with people-search links. Nothing is ever sent for you.
        </p>
      </div>

      <OutreachConsole rows={outreach} />
    </div>
  );
}
