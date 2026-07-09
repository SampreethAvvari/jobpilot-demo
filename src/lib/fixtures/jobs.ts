// The fictional jobs register. Every company and posting is invented.
// Hand-written rows carry the demo's stories (tailored artifacts, replies,
// an interview, a failed tailor); a seeded generator fills the register out
// to realistic volume. Timestamps are offsets from the visit, so the feed
// always looks freshly fetched.

import type { Job } from "../types";
import { daysAgo, fmtDate, fmtStamp, hoursAgo } from "./time";

export const DEMO_SCHEME = "demo:"; // internal links opened as in-app modals

function blank(): Omit<Job, "row" | "id" | "title" | "company"> {
  return {
    dateFound: "", location: "", remote: "", posted: "", postedAge: "·",
    url: "#posting", source: "", fit: null, why: "", sponsorship: "",
    resumeVariant: "", status: "New", notes: "", appliedDate: "",
    lastReply: "", replyClass: "", tailoredResume: "", coverLetter: "",
    jdKeywords: "", contact: "", draft: "", findPeople: "", role: "",
    resumeAts: "",
  };
}

type Partial_ = Partial<Job> & { id: string; title: string; company: string };

function job(p: Partial_): Job {
  return { ...blank(), row: 0, ...p };
}

/** Jobs whose ✨ Tailor button works in the demo: pressing it plays the real
 * pipeline states, then reveals these pre-built artifacts. */
export const TAILORABLE: Record<
  string,
  { tailoredResume: string; coverLetter: string; resumeAts: string; jdKeywords: string }
> = {
  "eb-aie": {
    tailoredResume: "/resumes/tailored-emberline-aie.pdf",
    coverLetter: "/resumes/cover-emberline-aie.pdf",
    resumeAts: "92",
    jdKeywords: "code assistants, prompt caching, evals, TypeScript, telemetry",
  },
  "kf-sde": {
    tailoredResume: "/resumes/tailored-kestrel-sde.pdf",
    coverLetter: "/resumes/cover-kestrel-sde.pdf",
    resumeAts: "90",
    jdKeywords: "Go, PostgreSQL, event-driven, idempotency, load pricing",
  },
  // The failed row: retry succeeds from the stored excerpt, showing recovery.
  "nf-mle": {
    tailoredResume: "/resumes/tailored-nimbus-mle.pdf",
    coverLetter: "/resumes/cover-nimbus-mle.pdf",
    resumeAts: "89",
    jdKeywords: "feature store, pipelines, Ray, model registry, monitoring",
  },
};

/** Jobs whose ✉ Draft button works in the demo (drafts written in drafts.ts). */
export const DRAFTABLE = new Set(["mw-fde", "oc-aie", "bl-mle", "dm-aie"]);

export function buildJobs(now: number): Job[] {
  const heroes: Job[] = [
    // ── Flagship: full artifacts, reports, chats ─────────────────────────
    job({
      id: "mw-fde", title: "Forward Deployed Engineer", company: "Marrowstone AI",
      location: "New York, NY", posted: fmtStamp(hoursAgo(now, 5)),
      dateFound: fmtDate(now), source: "greenhouse", fit: 96,
      why: "Customer-facing LLM deployments are exactly her Halespring + Ledgerlight profile; Go and Postgres cover their integration stack.",
      sponsorship: "likely", resumeVariant: "FDE", role: "FDE",
      tailoredResume: "/resumes/tailored-marrowstone-fde.pdf",
      coverLetter: "/resumes/cover-marrowstone-fde.pdf",
      resumeAts: "94",
      jdKeywords: "RAG, evals, deployment, stakeholder demos, Python, LLM guardrails",
    }),
    job({
      id: "oc-aie", title: "AI Engineer, Applied Models", company: "Osprey Compute",
      location: "Remote (US)", posted: fmtStamp(hoursAgo(now, 9)),
      dateFound: fmtDate(now), source: "ashby", fit: 94,
      why: "Serving and eval work on open-weight models lines up with Signalcast and her vision-lab fine-tuning.",
      sponsorship: "likely", resumeVariant: "AIE", role: "AIE",
      tailoredResume: "/resumes/tailored-osprey-aie.pdf",
      coverLetter: "/resumes/cover-osprey-aie.pdf",
      resumeAts: "93",
      jdKeywords: "inference, quantization, eval harness, PyTorch, Kubernetes",
    }),
    job({
      id: "dm-aie", title: "AI Engineer, Insights", company: "Driftwood Metrics",
      location: "New York, NY", posted: fmtStamp(hoursAgo(now, 3)),
      dateFound: fmtDate(now), source: "ashby", fit: 88,
      why: "NL-to-SQL over customer data is close to Atlas Notes retrieval; missing their dbt layer.",
      sponsorship: "unclear", resumeVariant: "AIE", role: "AIE",
    }),
    job({
      id: "eb-aie", title: "AI Engineer, Copilot Features", company: "Emberline",
      location: "Remote (US)", posted: fmtStamp(hoursAgo(now, 7)),
      dateFound: fmtDate(now), source: "ashby", fit: 93,
      why: "Building code-assistant features needs the prompt-eval loop she built in Signalcast; TypeScript depth checks out.",
      sponsorship: "likely", resumeVariant: "AIE", role: "AIE",
    }),
    job({
      id: "bl-mle", title: "Machine Learning Engineer, Risk", company: "Bluewater Ledger",
      location: "New York, NY", posted: fmtStamp(hoursAgo(now, 29)),
      dateFound: fmtDate(daysAgo(now, 1)), source: "greenhouse", fit: 91,
      why: "Fraud-signal modeling maps to her two-tower ranking work; payments-domain experience from Brightpath is a direct hit.",
      sponsorship: "likely", resumeVariant: "MLE", role: "MLE",
      tailoredResume: "/resumes/tailored-bluewater-mle.pdf",
      coverLetter: "/resumes/cover-bluewater-mle.pdf",
      resumeAts: "92",
      jdKeywords: "feature store, XGBoost, drift monitoring, BigQuery, precision-recall",
    }),
    job({
      id: "qz-sde", title: "Software Engineer, Distributed Storage", company: "Quartzline Systems",
      location: "Seattle, WA", posted: fmtStamp(hoursAgo(now, 43)),
      dateFound: fmtDate(daysAgo(now, 1)), source: "lever", fit: 89,
      why: "Go services at Brightpath and the p99 latency story fit their storage-path team; distributed-systems coursework helps.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
      tailoredResume: "/resumes/tailored-quartzline-sde.pdf",
      coverLetter: "/resumes/cover-quartzline-sde.pdf",
      resumeAts: "91",
      jdKeywords: "Go, consensus, replication, gRPC, observability",
    }),
    job({
      id: "bm-mle", title: "Research Engineer, Eval Infrastructure", company: "Brightmoor Labs",
      location: "San Francisco, CA", posted: fmtStamp(hoursAgo(now, 16)),
      dateFound: fmtDate(now), source: "ashby", fit: 89,
      why: "Signalcast is nearly this job: regression evals in CI, harness design, metric dashboards.",
      sponsorship: "likely", resumeVariant: "MLE", role: "MLE",
    }),
    job({
      id: "kf-sde", title: "Software Engineer, Marketplace", company: "Kestrel Freight",
      location: "Chicago, IL", posted: fmtStamp(hoursAgo(now, 26)),
      dateFound: fmtDate(daysAgo(now, 1)), source: "greenhouse", fit: 85,
      why: "Event-driven pricing needs the idempotent-API habits from Brightpath payments; freight domain is new.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
    }),
    job({
      id: "nf-mle", title: "ML Platform Engineer", company: "Nimbus Forge",
      location: "Remote (US)", posted: fmtStamp(hoursAgo(now, 50)),
      dateFound: fmtDate(daysAgo(now, 2)), source: "ashby", fit: 82,
      why: "Feature-store and pipeline work overlaps Halespring; their Ray stack is a gap.",
      sponsorship: "likely", resumeVariant: "MLE", role: "MLE",
      tailoredResume:
        "FAILED: JD not accessible (posting page returned 403). The pipeline retries with the stored excerpt; open the posting once, then hit retry.",
    }),
    job({
      id: "hg-de", title: "Data Engineer, Grid Telemetry", company: "Halcyon Grid",
      location: "Denver, CO", posted: fmtStamp(hoursAgo(now, 55)),
      dateFound: fmtDate(daysAgo(now, 2)), source: "workday", fit: 77,
      why: "Streaming ingestion matches her BigQuery feature-store build; no energy-sector background.",
      sponsorship: "unclear", resumeVariant: "MLE", role: "DE",
    }),

    // ── In flight: applied, replies, an interview ───────────────────────
    job({
      id: "tg-fde", title: "Forward Deployed Engineer", company: "Tidegate Analytics",
      location: "Austin, TX (hybrid)", posted: fmtStamp(daysAgo(now, 4)),
      dateFound: fmtDate(daysAgo(now, 3)), source: "smartrecruiters", fit: 88,
      why: "On-site data-platform rollouts reward her stakeholder-facing intern work; SQL depth is there.",
      sponsorship: "likely", resumeVariant: "FDE", role: "FDE",
      status: "Response", appliedDate: fmtDate(daysAgo(now, 2)),
      lastReply: fmtStamp(hoursAgo(now, 5)), replyClass: "next_step",
      tailoredResume: "/resumes/tailored-tidegate-fde.pdf",
      coverLetter: "/resumes/cover-tidegate-fde.pdf",
      resumeAts: "90",
      jdKeywords: "customer onboarding, SQL, dashboards, Python, discovery calls",
      notes: "recruiter asked for availability next week",
    }),
    job({
      id: "ln-aie", title: "AI Engineer, Retrieval", company: "Lanternfish AI",
      location: "New York, NY", posted: fmtStamp(daysAgo(now, 9)),
      dateFound: fmtDate(daysAgo(now, 8)), source: "lever", fit: 92,
      why: "Hybrid search plus reranking is Atlas Notes end to end; eval discipline from Signalcast seals it.",
      sponsorship: "likely", resumeVariant: "AIE", role: "AIE",
      status: "Interview", appliedDate: fmtDate(daysAgo(now, 8)),
      lastReply: fmtStamp(hoursAgo(now, 8)), replyClass: "next_step",
      notes: "onsite loop scheduling in progress",
    }),
    job({
      id: "cv-aie", title: "AI Engineer, Fraud Signals", company: "Coppervale",
      location: "Remote (US)", posted: fmtStamp(daysAgo(now, 5)),
      dateFound: fmtDate(daysAgo(now, 4)), source: "greenhouse", fit: 90,
      why: "LLM-assisted case triage plus classic ranking; her fraud-adjacent payments background applies.",
      sponsorship: "likely", resumeVariant: "AIE", role: "AIE",
      status: "Response", appliedDate: fmtDate(daysAgo(now, 4)),
      lastReply: fmtStamp(daysAgo(now, 1)), replyClass: "next_step",
      notes: "online assessment invite, 7 days to complete",
    }),
    job({
      id: "iv-sde", title: "Software Engineer, Detection", company: "Ironvale Security",
      location: "Boston, MA", posted: fmtStamp(daysAgo(now, 3)),
      dateFound: fmtDate(daysAgo(now, 3)), source: "greenhouse", fit: 84,
      why: "Rule-engine plus streaming pipeline work; Go and Postgres experience carries it.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
      status: "Response", appliedDate: fmtDate(daysAgo(now, 2)),
      lastReply: fmtStamp(hoursAgo(now, 3)), replyClass: "next_step",
      notes: "phone screen invite",
    }),
    job({
      id: "sc-mle", title: "ML Engineer, Perception", company: "Saltcreek Robotics",
      location: "Boston, MA", posted: fmtStamp(daysAgo(now, 4)),
      dateFound: fmtDate(daysAgo(now, 3)), source: "greenhouse", fit: 87,
      why: "CLIP fine-tuning and retrieval evals from the vision lab transfer straight to warehouse perception.",
      sponsorship: "likely", resumeVariant: "MLE", role: "MLE",
      status: "Applied", appliedDate: fmtDate(daysAgo(now, 1)),
      tailoredResume: "/resumes/tailored-saltcreek-mle.pdf",
      coverLetter: "/resumes/cover-saltcreek-mle.pdf",
      resumeAts: "91",
      jdKeywords: "CLIP, embeddings, detection, PyTorch, data curation",
    }),
    job({
      id: "cm-sde", title: "Backend Engineer, Sync", company: "Cloudmarrow",
      location: "Remote (US)", posted: fmtStamp(daysAgo(now, 4)),
      dateFound: fmtDate(daysAgo(now, 4)), source: "workable", fit: 81,
      why: "CRDT sync is new ground, but the API reliability record fits their pitch of boring correctness.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
      status: "Applied", appliedDate: fmtDate(daysAgo(now, 3)),
    }),
    job({
      id: "wd-de", title: "Data Engineer, Lakehouse", company: "Wrenfield Data",
      location: "Remote (US)", posted: fmtStamp(daysAgo(now, 6)),
      dateFound: fmtDate(daysAgo(now, 5)), source: "smartrecruiters", fit: 78,
      why: "Iceberg tables and ingestion SLAs; her BigQuery work covers half, Spark is thin.",
      sponsorship: "unclear", resumeVariant: "MLE", role: "DE",
      status: "Applied", appliedDate: fmtDate(daysAgo(now, 5)),
      lastReply: fmtStamp(daysAgo(now, 5)), replyClass: "automated_ack",
    }),
    job({
      id: "sb-fde", title: "Solutions Engineer", company: "Stonebridge Signal",
      location: "Chicago, IL", posted: fmtStamp(daysAgo(now, 5)),
      dateFound: fmtDate(daysAgo(now, 5)), source: "lever", fit: 83,
      why: "Pre-sales prototyping with real code; demo-building instincts from Ledgerlight launches.",
      sponsorship: "unclear", resumeVariant: "FDE", role: "FDE",
      status: "Outreach sent", appliedDate: fmtDate(daysAgo(now, 2)),
      contact: "careers@stonebridgesignal.example",
      draft: "demo:job-draft:sb-fde",
    }),

    // ── Closed: rejections and dismissals ───────────────────────────────
    job({
      id: "th-mle", title: "ML Engineer, Imaging", company: "Thistledown Health",
      location: "Remote (US)", posted: fmtStamp(daysAgo(now, 8)),
      dateFound: fmtDate(daysAgo(now, 7)), source: "lever", fit: 86,
      why: "Medical-imaging classifiers reward the vision-lab record; regulated-data experience missing.",
      sponsorship: "unclear", resumeVariant: "MLE", role: "MLE",
      status: "Rejected", appliedDate: fmtDate(daysAgo(now, 6)),
      lastReply: fmtStamp(daysAgo(now, 2)), replyClass: "rejection",
    }),
    job({
      id: "vl-aie", title: "AI Engineer", company: "Veridian Loop",
      location: "Portland, OR", posted: fmtStamp(daysAgo(now, 9)),
      dateFound: fmtDate(daysAgo(now, 9)), source: "workable", fit: 80,
      why: "Recommendation copilot for supply chains; solid overlap, small team wants on-site.",
      sponsorship: "unlikely", resumeVariant: "AIE", role: "AIE",
      status: "Rejected", appliedDate: fmtDate(daysAgo(now, 8)),
      lastReply: fmtStamp(daysAgo(now, 3)), replyClass: "rejection",
    }),
    job({
      id: "pf-sde", title: "Gameplay Tools Engineer", company: "Palefire Studio",
      location: "Los Angeles, CA", posted: fmtStamp(daysAgo(now, 6)),
      dateFound: fmtDate(daysAgo(now, 6)), source: "recruitee", fit: 74,
      why: "Tooling chops apply, but engine work in C++ is outside her stack.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
      status: "Dismissed", notes: "dismissed: not relevant",
    }),
  ];

  return [...heroes, ...filler(now)].map((j, i) => ({ ...j, row: i + 2 }));
}

// ── Seeded filler: volume without hand-writing 80 rows ─────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WATCHED: [string, string][] = [
  ["Marrowstone AI", "greenhouse"], ["Osprey Compute", "ashby"],
  ["Bluewater Ledger", "greenhouse"], ["Quartzline Systems", "lever"],
  ["Tidegate Analytics", "smartrecruiters"], ["Emberline", "ashby"],
  ["Saltcreek Robotics", "greenhouse"], ["Kestrel Freight", "greenhouse"],
  ["Nimbus Forge", "ashby"], ["Halcyon Grid", "workday"],
  ["Coppervale", "greenhouse"], ["Thistledown Health", "lever"],
  ["Wrenfield Data", "smartrecruiters"], ["Veridian Loop", "workable"],
  ["Pinebarrel", "recruitee"], ["Cinderpath", "lever"],
  ["Northgale", "workday"], ["Brightmoor Labs", "ashby"],
  ["Stonebridge Signal", "lever"], ["Cloudmarrow", "workable"],
  ["Ironvale Security", "greenhouse"], ["Driftwood Metrics", "ashby"],
  ["Sunhollow Energy", "workday"], ["Palefire Studio", "recruitee"],
  ["Lanternfish AI", "lever"],
];

const AGGREGATED: [string, string][] = [
  ["Parchment Row", "remoteok"], ["Hollybrook", "hn"], ["Glassfin", "adzuna"],
  ["Tornwick", "linkedin"], ["Silverbirch Systems", "adzuna"],
  ["Foundry North", "hn"], ["Maplewright", "remoteok"], ["Oxbow Digital", "linkedin"],
  ["Redcedar Labs", "adzuna"], ["Summitline", "hn"], ["Harborlight Tech", "linkedin"],
  ["Quillfeather", "remoteok"], ["Bramblewood", "adzuna"], ["Vantage Hollow", "linkedin"],
  ["Nightingale Apps", "adzuna"], ["Fernwheel", "hn"], ["Saddleback Systems", "linkedin"],
  ["Willowmere", "remoteok"], ["Copperfield Grid", "adzuna"], ["Marlin & Vane", "linkedin"],
];

const TITLES: Record<string, string[]> = {
  AIE: ["AI Engineer", "GenAI Engineer", "LLM Application Engineer", "Applied AI Engineer", "AI Product Engineer"],
  MLE: ["Machine Learning Engineer", "ML Engineer, Ranking", "ML Infrastructure Engineer", "Applied Scientist I", "Computer Vision Engineer"],
  SDE: ["Software Engineer", "Backend Engineer", "Full Stack Engineer", "Platform Engineer", "Software Engineer, APIs"],
  FDE: ["Forward Deployed Engineer", "Solutions Engineer", "Customer Engineer", "Field AI Engineer"],
};
const VARIANT_ROLE: Record<string, string> = { AIE: "AIE", MLE: "MLE", SDE: "SWE", FDE: "FDE" };

const LOCATIONS = [
  "New York, NY", "Remote (US)", "San Francisco, CA", "Austin, TX",
  "Seattle, WA", "Boston, MA", "Denver, CO", "Chicago, IL", "Remote (US)",
  "New York, NY",
];

const WHYS = [
  "Retrieval work maps to Atlas Notes; their %s stack is a modest gap.",
  "Eval-first team; Signalcast experience is the differentiator, %s less so.",
  "Backend depth from Brightpath fits; %s exposure would need ramp-up.",
  "Recsys overlap from Halespring is strong; domain knowledge in %s is thin.",
  "Solid stack match on Python and %s; scope reads slightly senior.",
  "Fine-tuning record fits their model team; %s pipeline is new territory.",
  "Customer-facing instincts plus working code; %s certification not held.",
  "Streaming and %s pipeline experience carries the data half of the role.",
  "Strong on APIs and Postgres; %s is listed as required and unproven.",
  "Vision-lab metrics work matches their %s evaluation loop.",
];
const GAPS = ["Ray", "Rust", "Spark", "Kafka", "Terraform", "dbt", "C++", "Snowflake", "Kubernetes", "Airflow"];

export function filler(now: number): Job[] {
  const rand = mulberry32(7);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const out: Job[] = [];
  const variants = Object.keys(TITLES);
  for (let k = 0; k < 72; k++) {
    const watched = rand() < 0.62;
    const [company, source] = watched
      ? WATCHED[Math.floor(rand() * WATCHED.length)]
      : AGGREGATED[Math.floor(rand() * AGGREGATED.length)];
    const variant = variants[Math.floor(rand() * variants.length)];
    const fit = rand() < 0.18
      ? Math.floor(42 + rand() * 26) // sub-70 noise, hidden by the default filter
      : Math.floor(70 + rand() * 23);
    const postedH = 2 + Math.floor(rand() * 640); // up to ~26 days back
    const foundH = Math.max(1, postedH - 2 - Math.floor(rand() * 8));
    const closed = rand();
    const status = closed < 0.06 ? "Dismissed" : closed < 0.12 ? "Rejected" : "New";
    out.push(
      job({
        id: `gen-${k}`,
        title: pick(TITLES[variant]),
        company,
        location: pick(LOCATIONS),
        posted: fmtStamp(hoursAgo(now, postedH)),
        dateFound: fmtDate(hoursAgo(now, foundH)),
        source,
        fit,
        why: pick(WHYS).replace("%s", pick(GAPS)),
        sponsorship: rand() < 0.45 ? "likely" : rand() < 0.75 ? "unclear" : "unlikely",
        resumeVariant: variant,
        role: VARIANT_ROLE[variant],
        status,
        notes: status === "Dismissed" ? "dismissed: not relevant" : "",
        appliedDate: status === "Rejected" ? fmtDate(hoursAgo(now, postedH - 12)) : "",
        lastReply: status === "Rejected" ? fmtStamp(hoursAgo(now, Math.floor(postedH / 2))) : "",
        replyClass: status === "Rejected" ? "rejection" : "",
      }),
    );
  }
  return out;
}

/** Fresh postings injected when the visitor presses Refresh: the hourly
 * fast-fetch, compressed into six seconds. */
export function freshJobs(now: number, startRow: number): Job[] {
  const fresh: Partial_[] = [
    {
      id: "fresh-1", title: "AI Engineer, Assistants", company: "Pinebarrel",
      location: "New York, NY", posted: fmtStamp(hoursAgo(now, 1)),
      source: "recruitee", fit: 91,
      why: "Assistant-workflow features need her RAG plus evals combination; small team, broad scope.",
      sponsorship: "likely", resumeVariant: "AIE", role: "AIE",
    },
    {
      id: "fresh-2", title: "Machine Learning Engineer", company: "Cinderpath",
      location: "Remote (US)", posted: fmtStamp(hoursAgo(now, 2)),
      source: "lever", fit: 86,
      why: "Ranking work on a marketplace feed; two-tower experience from Halespring applies directly.",
      sponsorship: "unclear", resumeVariant: "MLE", role: "MLE",
    },
    {
      id: "fresh-3", title: "Software Engineer, Integrations", company: "Northgale",
      location: "Minneapolis, MN", posted: fmtStamp(hoursAgo(now, 2)),
      source: "workday", fit: 79,
      why: "Partner-API build-out; idempotent webhook design from Brightpath is the core skill.",
      sponsorship: "unclear", resumeVariant: "SDE", role: "SWE",
    },
    {
      id: "fresh-4", title: "Forward Deployed Engineer, Enterprise", company: "Sunhollow Energy",
      location: "Houston, TX", posted: fmtStamp(hoursAgo(now, 3)),
      source: "workday", fit: 82,
      why: "Utility-side analytics rollouts; on-site discovery plus SQL fits the FDE profile.",
      sponsorship: "unlikely", resumeVariant: "FDE", role: "FDE",
    },
    {
      id: "fresh-5", title: "LLM Application Engineer", company: "Foundry North",
      location: "Remote (US)", posted: fmtStamp(hoursAgo(now, 1)),
      source: "hn", fit: 88,
      why: "Founder post asks for someone who has shipped RAG with eval coverage; Atlas Notes plus Signalcast is that resume.",
      sponsorship: "unclear", resumeVariant: "AIE", role: "AIE",
    },
  ];
  return fresh.map((p, i) =>
    job({ ...p, dateFound: fmtDate(now), postedAge: "just now" }),
  ).map((j, i) => ({ ...j, row: startRow + i }));
}
