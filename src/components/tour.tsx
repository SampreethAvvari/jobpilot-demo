"use client";

// The guided tour. A thin controller on top of driver.js: each step names a
// page, a stable data-tour target, and optionally an event that stages the
// scene (open the chat drawer, pin the ATS report, run the demo tailor).
// Navigation waits for the target to exist before highlighting, so the
// sequence is deterministic on any connection.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import type { Driver, driver as DriverFactory } from "driver.js";

type Step = {
  path: string;
  el: string; // data-tour value
  title: string;
  body: string;
  arrive?: () => void; // stage the scene after the element exists
  leave?: () => void;  // tear it down before moving on
};

const fire = (name: string, detail?: string) =>
  window.dispatchEvent(new CustomEvent(name, { detail }));

const STEPS: Step[] = [
  {
    path: "/jobs/", el: "jobs-table",
    title: "The jobs feed",
    body: "Every hour the pipeline polls 11 sources, drops anything senior, non-US, or unsponsored, and lands the rest here. Nobody scrolled a job board for any of this.",
  },
  {
    path: "/jobs/", el: "fit-cell",
    title: "AI fit scores",
    body: "Gemini scores each job 0 to 100 against the pilot's profile, with a one-line why under the title and a sponsorship read. Under 75 is hidden by default; unknown is not treated as bad.",
  },
  {
    path: "/jobs/", el: "filters",
    title: "Slice the feed",
    body: "Status, source, role category, best-match resume variant, company size, fit floor, posting recency, and three sorts. The feed stays useful at hundreds of rows.",
  },
  {
    path: "/jobs/", el: "docs-cell",
    title: "Tailored documents",
    body: "This job already has a one-page tailored resume and cover letter, compiled to ATS-clean PDFs. The ATS 94 badge is the judge's score. Next: the receipts behind it.",
  },
  {
    path: "/jobs/", el: "ats-panel",
    title: "The transparency report",
    body: "Every keyword's story: the exact JD sentence it came from, whether the baseline already had it, and what the tailor did. When experience is genuinely missing, it says so. The tailor can never invent facts.",
    arrive: () => fire("demo:open-ats", "mw-fde"),
    leave: () => fire("demo:close-ats"),
  },
  {
    path: "/jobs/", el: "apply-cell",
    title: "Apply stays human",
    body: "Apply opens the posting; when you come back, JobPilot asks whether you applied and stamps the date. It never submits anything for you. The ✕ dismisses a bad match forever.",
  },
  {
    path: "/jobs/", el: "tailor-cell",
    title: "Tailor on demand",
    body: "This Emberline job has no documents yet, so the demo just pressed ✨ Tailor for you. In the real console this takes about a minute: keywords, guarded rewrite, judge loop, PDFs to Drive. Watch the cell.",
    arrive: () => fire("demo:tailor", "eb-aie"),
  },
  {
    path: "/jobs/", el: "chat-drawer",
    title: "A copilot per job",
    body: "Every row's 💬 opens a chat grounded in the pilot's real background plus this job's description. The demo replays recorded answers; watch one type itself out, then try the other questions after the tour.",
    arrive: () => {
      fire("demo:open-chat", "mw-fde");
      setTimeout(() => fire("demo:play-chip"), 700);
    },
    leave: () => fire("demo:close-chat"),
  },
  {
    path: "/resumes/", el: "resume-card",
    title: "The resume armory",
    body: "Four master resumes, one per role framing, each scored by a calibrated judge (impact, brevity, style, sections, soft skills). Tailoring always starts from the best master for the job.",
  },
  {
    path: "/companies/", el: "watch-form",
    title: "Watch any company",
    body: "Type a name and the pipeline finds its job board: Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Workable, or Recruitee, then polls it every 30 minutes. Try adding one after the tour.",
  },
  {
    path: "/companies/", el: "companies-table",
    title: "Board health at a glance",
    body: "Left to apply counts what is still open for you to act on. Newest job shows how fresh each company's best opening is, green when under a day. Broken boards show their error instead of failing silently.",
  },
  {
    path: "/outreach/", el: "outreach-form",
    title: "Cold outreach, drafted",
    body: "Search a company: best-fit resume, a short technical email, a tailored cover letter, and a published careers email scraped from the company's own site, never guessed. It lands in Gmail drafts.",
  },
  {
    path: "/outreach/", el: "outreach-table",
    title: "Never auto-sent",
    body: "Every draft waits for the pilot to read, edit, and send it. Click any open draft link to read one. That rule is structural: the system has no code path that sends email.",
  },
  {
    path: "/replies/", el: "replies-table",
    title: "The inbox watches itself",
    body: "Four inboxes are scanned hourly. A real next step (interview, assessment, scheduling) sends an instant alert with a deep link; rejections file themselves quietly. Misreads take one dropdown to fix.",
  },
  {
    path: "/tailor/", el: "tailor-inputs",
    title: "Now with a live model",
    body: "Everything so far was recorded. This page is real: paste your own bullets and a job description, and a model on Cloudflare's free tier tailors them under the same no-inventing rule.",
  },
  {
    path: "/run-your-own/", el: "run-your-own",
    title: "Run the whole thing yourself",
    body: "The demo is free because it is canned; the real autopilot runs on your own cloud for about $0 to $10 a month. This page has the copy-paste prompt that sets it up. Thanks for flying.",
  },
];

function waitFor(sel: string, timeoutMs = 6000): Promise<Element | null> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const el = document.querySelector(`[data-tour="${sel}"]`);
      if (el) return resolve(el);
      if (Date.now() - started > timeoutMs) return resolve(null);
      setTimeout(tick, 90);
    };
    tick();
  });
}

export function TourLauncher() {
  const router = useRouter();
  const path = usePathname();
  const [welcome, setWelcome] = useState(false);
  const drv = useRef<Driver | null>(null);
  const idx = useRef(-1);
  const busyRef = useRef(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("jp-demo-welcome-v1")) setWelcome(true);
    } catch { /* storage blocked: skip the overlay */ }
  }, []);

  function dismissWelcome() {
    setWelcome(false);
    try { localStorage.setItem("jp-demo-welcome-v1", "1"); } catch { /* fine */ }
  }

  async function ensureDriver(): Promise<Driver> {
    if (drv.current) return drv.current;
    const { driver } = (await import("driver.js")) as { driver: typeof DriverFactory };
    drv.current = driver({
      popoverClass: "jp-tour",
      animate: true,
      stagePadding: 6,
      stageRadius: 10,
      allowClose: true,
      overlayOpacity: 0.66,
      showButtons: ["next", "previous", "close"],
      onNextClick: () => { void go(idx.current + 1); },
      onPrevClick: () => { void go(idx.current - 1); },
      onCloseClick: () => end(),
      onDestroyStarted: () => end(),
    });
    return drv.current;
  }

  function end() {
    STEPS[idx.current]?.leave?.();
    idx.current = -1;
    drv.current?.destroy();
    drv.current = null;
  }

  async function go(i: number) {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      STEPS[idx.current]?.leave?.();
      if (i < 0 || i >= STEPS.length) { end(); return; }
      const step = STEPS[i];
      idx.current = i;
      const here = window.location.pathname.replace(/\/?$/, "/");
      if (here !== step.path) {
        router.push(step.path);
        // let the page mount before staging events fire
        await waitFor("tour-button");
        await new Promise((r) => setTimeout(r, 120));
      }
      step.arrive?.(); // stage the scene; all arrive events are idempotent
      const el = await waitFor(step.el);
      if (!el) { busyRef.current = false; void go(i + 1); return; }
      (await ensureDriver()).highlight({
        element: `[data-tour="${step.el}"]`,
        popover: {
          title: step.title,
          description:
            `${step.body}<div style="margin-top:8px" class="recorded-tag">step ${i + 1} of ${STEPS.length}</div>`,
          side: "bottom",
          align: "start",
          showButtons: i === 0 ? ["next", "close"] : ["next", "previous", "close"],
          nextBtnText: i === STEPS.length - 1 ? "Finish" : "Next →",
          prevBtnText: "← Back",
        },
      });
    } finally {
      busyRef.current = false;
    }
  }

  function start() {
    dismissWelcome();
    void go(0);
  }

  // Restart cleanly if the visitor navigates with browser buttons mid-tour.
  useEffect(() => {
    if (idx.current >= 0) {
      const step = STEPS[idx.current];
      const here = path.replace(/\/?$/, "/");
      if (step && step.path !== here) end();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return (
    <>
      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={start}
              data-tour="tour-button"
              title="A guided walk through every feature, about two minutes">
        ▸ Tour
      </button>

      {/* Portaled to body: the sticky header's backdrop-filter would otherwise
          become the containing block and pin this overlay to the header. */}
      {welcome && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9980, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "rgba(29, 29, 31, 0.42)", backdropFilter: "blur(3px)",
          }}
        >
          <div
            className="welcome-card card"
            style={{
              width: "100%", maxWidth: 480, margin: 16, padding: 32,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="display text-2xl font-extrabold tracking-tight">
              JOB<span style={{ color: "var(--amber)" }}>PILOT</span>
            </div>
            <p className="mt-3 text-xs leading-6" style={{ color: "var(--ink-55)" }}>
              This is JobPilot, an open-source job-hunt autopilot: it finds jobs
              hourly, AI-scores them against you, tailors one-page resumes with
              receipts, drafts the outreach, and watches your inbox for replies.
            </p>
            <p className="mt-2 text-xs leading-6" style={{ color: "var(--ink-55)" }}>
              You are flying as <b style={{ color: "var(--ink)" }}>Jane Doe</b>, a
              fictional pilot with fictional companies. Real product, canned data:
              click anything, break nothing, it resets on reload.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="btn btn-primary px-5 py-2.5 text-xs" onClick={start}>
                ▸ Take the tour (2 min)
              </button>
              <button className="btn-ghost px-5 py-2.5 text-xs" onClick={dismissWelcome}>
                Explore on my own
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
