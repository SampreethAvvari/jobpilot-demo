"use client";

// The tour's finale: what the real system is, what it costs, and the
// copy-paste prompt that sets it up on the visitor's own cloud.

import { useState } from "react";

const AGENT_PROMPT = `Clone https://github.com/SampreethAvvari/job-pilot and read docs/FORK-SETUP.md end to end. Set the whole system up for me on my own Google Cloud project with my own billing: GCP project, OAuth consent and tokens, Secret Manager, the Cloud Run pipeline job and console service, schedulers, and CI via Workload Identity Federation. Use my profile and my resumes (I will provide them; put them in private/, never commit them). Walk me through every step that needs my browser, my card, or my approval, and confirm every scope you request. Nothing may ever auto-send email or auto-submit applications.`;

const FEATURES = [
  ["Hourly job feed", "11 sources: 7 ATS board APIs polled directly plus aggregators, filtered before you ever see them"],
  ["AI fit scores", "Gemini scores each role 0 to 100 against your profile with a one-line why and a sponsorship signal"],
  ["Honest tailoring", "One-page LaTeX resume + cover letter per match, judge loop, transparency report; it can never invent facts"],
  ["Company watchlist", "Type a name, the resolver detects its ATS and starts polling its board"],
  ["Cold outreach", "Short technical drafts to published careers emails only, dropped in your Gmail drafts"],
  ["Inbox watch", "Recruiter replies classified hourly: next steps alert you instantly, rejections file themselves"],
] as const;

export default function RunYourOwnPage() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(AGENT_PROMPT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="rise mx-auto max-w-3xl" data-tour="run-your-own">
      <div className="mb-6">
        <div className="eyebrow">the exit ramp</div>
        <h1 className="display mt-1 text-3xl font-extrabold tracking-tight">
          Run your <span style={{ color: "var(--amber)" }}>own</span> JobPilot
        </h1>
        <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
          Everything you just toured is open source (MIT). This demo is canned so it
          can be free for everyone; the real system runs on your own Google Cloud
          billing with your own keys, and your data never touches anyone else&apos;s
          infrastructure, including the author&apos;s.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map(([title, blurb]) => (
          <div key={title} className="panel p-4">
            <div className="font-bold" style={{ color: "var(--text)" }}>{title}</div>
            <p className="mt-1 text-[11px] leading-4" style={{ color: "var(--text-dim)" }}>
              {blurb}
            </p>
          </div>
        ))}
      </div>

      <div className="panel mt-6 p-5">
        <div className="eyebrow">what it costs</div>
        <p className="mt-2 text-xs leading-5" style={{ color: "var(--text-dim)" }}>
          Roughly <b style={{ color: "var(--text)" }}>$0 to $10 a month</b>: Cloud Run
          and Cloud Scheduler sit inside GCP free tiers at this scale, Gemini Flash
          scoring costs pennies per run, and the board APIs are free and keyless.
          Optional free-tier keys (Adzuna, Apify, Hunter, Serper) widen the reach and
          degrade gracefully when absent. The design rules hold on your fork too:
          nothing outbound is ever automatic, and the tailor cannot lie.
        </p>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="eyebrow">hand this to an AI coding agent</div>
          <button className="btn-amber px-3 py-1.5 text-[11px]" onClick={copy}>
            {copied ? "✓ copied" : "copy prompt"}
          </button>
        </div>
        <pre
          className="panel overflow-x-auto p-4 text-[11px] leading-5"
          style={{ whiteSpace: "pre-wrap", color: "var(--text-dim)" }}
        >
          {AGENT_PROMPT}
        </pre>
        <p className="mt-2 text-[11px]" style={{ color: "var(--text-faint)" }}>
          docs/FORK-SETUP.md was written to be handed to an agent: copy-paste commands,
          exact OAuth scopes with the reason for each, and an appendix explaining every
          feature&apos;s config knob. About 30 minutes end to end.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <a className="btn-amber px-4 py-2" href="https://github.com/SampreethAvvari/job-pilot"
           target="_blank" rel="noopener">
          github.com/SampreethAvvari/job-pilot ↗
        </a>
        <a className="btn-ghost px-4 py-2"
           href="https://github.com/SampreethAvvari/job-pilot/blob/master/docs/FORK-SETUP.md"
           target="_blank" rel="noopener">
          read FORK-SETUP.md first ↗
        </a>
        <a className="btn-ghost px-4 py-2"
           href="https://github.com/SampreethAvvari/job-pilot/blob/master/QUICKSTART.md"
           target="_blank" rel="noopener">
          or try it locally in 5 minutes ↗
        </a>
      </div>

      <p className="mt-8 text-[11px]" style={{ color: "var(--text-faint)" }}>
        Built by Sampreeth Avvari ·{" "}
        <a className="hover:underline" href="https://sampreethavvari.github.io"
           target="_blank" rel="noopener">
          sampreethavvari.github.io
        </a>
        {" "}· this demo&apos;s data is fictional and resets on reload
      </p>
    </div>
  );
}
